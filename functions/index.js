const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

// exports.backfillDefaults = functions.https.onRequest(
//   async (req, res) => {
//     const snapshot = await admin.firestore()
//       .collection("questions")
//       .get();

//     const batch = admin.firestore().batch();

//     snapshot.docs.forEach(doc => {
//       if (!doc.data().status) {
//         batch.update(doc.ref, { status: "pending" });
//       }
//     });

//     await batch.commit();
//     res.send("Backfill complete");
//   }
// );

// First-to-buzz arbitration
exports.arbitrateBuzzer = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { gameId, playerId } = data;
  const gameRef = db.collection('games').doc(gameId);
  const gameDoc = await gameRef.get();

  if (!gameDoc.exists) {
    throw new functions.https.HttpsError('not-found', 'Game not found');
  }

  const gameData = gameDoc.data();
  const matchStateRef = db.collection('matchStates').doc(gameId);

  // Check if buzzer is already locked
  const matchStateDoc = await matchStateRef.get();
  const matchState = matchStateDoc.exists ? matchStateDoc.data() : null;

  if (matchState && matchState.buzzerState === 'locked') {
    throw new functions.https.HttpsError('failed-precondition', 'Buzzer already locked');
  }

  // Lock buzzer and assign to this player
  await matchStateRef.set({
    buzzerState: 'locked',
    buzzedBy: playerId,
    buzzedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  return { success: true, playerId, timestamp: Date.now() };
});

// Create match
exports.createMatch = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { type, playerId, teamId, coachId, questionIds } = data;

  const gameRef = db.collection('games').doc();
  await gameRef.set({
    type,
    playerId,
    teamId: teamId || null,
    coachId: coachId || null,
    questionIds,
    startedAt: admin.firestore.FieldValue.serverTimestamp(),
    status: 'active',
  });

  // Initialize match state
  await db.collection('matchStates').doc(gameRef.id).set({
    gameId: gameRef.id,
    currentQuestionIndex: 0,
    questionStartTime: Date.now(),
    buzzerState: 'idle',
    revealedWordsCount: 0,
    questionFullyRevealed: false,
  });

  return { gameId: gameRef.id };
});

// Write match stats
exports.writeMatchStats = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { gameId, matchHistory, playerStats } = data;

  const batch = db.batch();

  // Write match history
  const matchRef = db.collection('matchHistory').doc();
  batch.set(matchRef, {
    ...matchHistory,
    startedAt: admin.firestore.FieldValue.serverTimestamp(),
    completedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  // Update player stats
  if (playerStats) {
    const playerRef = db.collection('players').doc(playerStats.playerId);
    batch.update(playerRef, {
      gamesPlayed: admin.firestore.FieldValue.increment(1),
      totalScore: admin.firestore.FieldValue.increment(playerStats.score),
      totalQuestions: admin.firestore.FieldValue.increment(playerStats.total),
      // Update correctBySubject
      ...Object.keys(playerStats.correctBySubject).reduce((acc, subject) => {
        acc[`correctBySubject.${subject}`] = admin.firestore.FieldValue.increment(
          playerStats.correctBySubject[subject]
        );
        return acc;
      }, {}),
    });
  }

  // Update game status
  const gameRef = db.collection('games').doc(gameId);
  batch.update(gameRef, {
    status: 'completed',
    endedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();

  // Trigger leaderboard calculation
  await calculateLeaderboardForTeam(playerStats.teamId);

  return { success: true };
});

// Calculate leaderboard for a team
async function calculateLeaderboardForTeam(teamId) {
  const playersSnapshot = await db.collection('players')
    .where('teamId', '==', teamId)
    .get();

  const leaderboardEntries = [];

  for (const playerDoc of playersSnapshot.docs) {
    const player = playerDoc.data();
    const accuracy = player.totalQuestions > 0
      ? (player.totalScore / player.totalQuestions) * 100
      : 0;

    const leaderboardEntry = {
      playerId: playerDoc.id,
      teamId,
      displayName: player.displayName,
      accuracy,
      avgBuzzTime: player.avgBuzzTime || 0,
      wins: player.wins || 0,
      highScore: player.highScore || 0,
      totalGames: player.gamesPlayed || 0,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection('leaderboards').doc(playerDoc.id).set(leaderboardEntry);
    leaderboardEntries.push(leaderboardEntry);
  }

  return leaderboardEntries;
}

// Calculate leaderboard (callable function)
exports.calculateLeaderboard = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { teamId } = data;
  return await calculateLeaderboardForTeam(teamId);
});

// Commit question edit (with access control)
exports.commitQuestionEdit = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { questionId, updates, operation } = data; // operation: 'create' | 'update' | 'delete'
  const userId = context.auth.uid;

  // Get user data to check role
  const userDoc = await db.collection('users').doc(userId).get();
  const userData = userDoc.data();

  if (userData.role !== 'coach') {
    throw new functions.https.HttpsError('permission-denied', 'Only coaches can edit questions');
  }

  if (operation === 'create') {
    const questionRef = db.collection('questions').doc();
    await questionRef.set({
      ...updates,
      createdBy: userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { questionId: questionRef.id };
  } else if (operation === 'update') {
    const questionRef = db.collection('questions').doc(questionId);
    const questionDoc = await questionRef.get();

    if (!questionDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Question not found');
    }

    const questionData = questionDoc.data();

    // Check if user owns this question or it's public
    if (!questionData.isPublic && questionData.createdBy !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'You can only edit your own questions');
    }

    await questionRef.update({
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true };
  } else if (operation === 'delete') {
    const questionRef = db.collection('questions').doc(questionId);
    const questionDoc = await questionRef.get();

    if (!questionDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Question not found');
    }

    const questionData = questionDoc.data();

    // Check if user owns this question
    if (questionData.createdBy !== userId) {
      throw new functions.https.HttpsError('permission-denied', 'You can only delete your own questions');
    }

    await questionRef.delete();
    return { success: true };
  }

  throw new functions.https.HttpsError('invalid-argument', 'Invalid operation');
});










