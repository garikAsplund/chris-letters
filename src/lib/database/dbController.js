import { dbRef } from './firebase';
import { child, get, set, update, runTransaction } from 'firebase/database';
import ShortUniqueId from 'short-unique-id';
import { things } from '$lib/stores/GameStore';
import { NUMBER_OF_TRIALS } from '$lib/logic/ConstantsAndHelpers';

export const dbController = {
	async getTargetColor() {
		try {
			const index = await runTransaction(child(dbRef, 'settings/targetColor'), (currentIndex) => {
				return currentIndex === 1 ? 0 : 1;
			});

			return index.snapshot.val();
		} catch (error) {
			console.error(error);
		}
	},

	async getTrialOrder() {
		try {
			const index = await runTransaction(child(dbRef, 'settings/trialOrder'), (currentIndex) => {
				return (currentIndex + 1) % 6;
			});

			return index.snapshot.val();
		} catch (error) {
			console.error(error);
		}
	},

	async getAllUsers() {
		try {
			const snapshot = await get(child(dbRef, 'users'));
			if (snapshot.exists()) {
				const data = snapshot.val();
				things.set(data);
			} else {
				console.log('No data available');
			}
		} catch (error) {
			console.error(error);
		}
	},

	async changeAdminStatus(userId, adminStatus) {
		try {
			await set(child(dbRef, `users/${userId}/admin`), !adminStatus);
			things.update((users) => {
				users[userId].admin = !adminStatus;
				return users;
			});
		} catch (error) {
			console.error(error);
		}
	},

	async writeParticipantData(userId, gender, handedness, age, problemDescription) {
		try {
			await update(child(dbRef, `users/${userId}`), {
				gender: gender,
				age: age,
				handedness: handedness,
				problemDescription: problemDescription
			});
		} catch (error) {
			console.error(error);
		}
	},

	async writeTrialData(
		userId,
		trialType,
		everyTarget,
		everyGuess,
		everyAccuracy,
		everyReactionTime
	) {
		try {
			const uid = new ShortUniqueId();
			const trialId = uid();

			await set(child(dbRef, `blocks/${userId}/${trialId}`), {
				trialType: trialType,
				targets: everyTarget,
				guesses: everyGuess,
				accuracy: everyAccuracy,
				reactionTime: everyReactionTime
			});
		} catch (error) {
			console.error(error);
		}
	},

	async writeAB(userId, everyTarget, everyGuess, everyAccuracy, everyReactionTime, sessionNumber) {
		try {
			const updates = {};

			for (let i = 0; i < NUMBER_OF_TRIALS; i++) {
				updates[`AB/${userId}/session${sessionNumber}/${i + 1}`] = {
					targets: everyTarget[i],
					guesses: everyGuess[i],
					accuracy: everyAccuracy[i],
					reactionTime: everyReactionTime[i]
				};
			}

			await update(dbRef, updates);
		} catch (error) {
			console.error(error);
		}
	},

	async writeCC(
		userId,
		everyTarget,
		everyGuess,
		everyAccuracy,
		everyReactionTime,
		blockCount,
		sessionNumber
	) {
		try {
			const updates = {};

			for (let i = 0; i < NUMBER_OF_TRIALS; i++) {
				updates[`CC/${userId}/session${sessionNumber}/block${blockCount}/${i + 1}`] = {
					targets: everyTarget[i],
					guesses: everyGuess[i],
					accuracy: everyAccuracy[i],
					reactionTime: everyReactionTime[i]
				};
			}

			await update(dbRef, updates);
		} catch (error) {
			console.error(error);
		}
	},

	async writeSiB(
		userId,
		everyTarget,
		everyGuess,
		everyAccuracy,
		everyReactionTime,
		blockCount,
		sessionNumber
	) {
		try {
			const updates = {};

			for (let i = 0; i < NUMBER_OF_TRIALS; i++) {
				updates[`SiB/${userId}/session${sessionNumber}/block${blockCount}/${i + 1}`] = {
					targets: everyTarget[i],
					guesses: everyGuess[i],
					accuracy: everyAccuracy[i],
					reactionTime: everyReactionTime[i]
				};
			}

			await update(dbRef, updates);
		} catch (error) {
			console.error(error);
		}
	}
};
