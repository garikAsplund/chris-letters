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

	async updateSessionNumber(userId) {
		try {
			const index = await runTransaction(
				child(dbRef, `users/${userId}/sessionNumber`),
				(currentIndex) => {
					return currentIndex + 1;
				}
			);

			return index.snapshot.val();
		} catch (error) {
			console.error(error);
		}
	},

	async getSessionNumber(userId) {
		try {
			const snapshot = await get(child(dbRef, `users/${userId}/sessionNumber`));
			return snapshot.val();
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

	async writeAB(
		userId,
		everyTarget,
		everyGuess,
		everyAccuracy,
		everyReactionTime,
		sessionNumber,
		RSVP,
		t1Position,
		t2Position,
		targetColor
	) {
		try {
			const updates = {};

			for (let i = 0; i < NUMBER_OF_TRIALS; i++) {
				updates[`AB/${userId}/session${sessionNumber}/${i + 1}`] = {
					target: everyTarget[i],
					responses: everyGuess[i],
					accuracy: everyAccuracy[i],
					reactionTime: everyReactionTime[i],
					RSVP: RSVP[i],
					t1Position: t1Position[i],
					t2Position: `+${t2Position[i]}`,
					targetColor: targetColor
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
		sessionNumber,
		RSVP,
		targetPosition,
		distractorPosition,
		distractorColor,
		targetColor
	) {
		try {
			const updates = {};

			for (let i = 0; i < NUMBER_OF_TRIALS; i++) {
				updates[`CC/${userId}/session${sessionNumber}/block${blockCount}/${i + 1}`] = {
					target: everyTarget[i],
					response: everyGuess[i],
					accuracy: everyAccuracy[i],
					reactionTime: everyReactionTime[i],
					RSVP: RSVP[i],
					targetPosition: targetPosition[i] + distractorPosition[i],
					distractorPosition: `-${targetPosition[i]}`,
					distractorColor: distractorColor[i],
					targetColor: targetColor
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
		sessionNumber,
		RSVP
	) {
		try {
			const updates = {};

			for (let i = 0; i < NUMBER_OF_TRIALS; i++) {
				updates[`SiB/${userId}/session${sessionNumber}/block${blockCount}/${i + 1}`] = {
					target: everyTarget[i],
					response: everyGuess[i],
					accuracy: everyAccuracy[i],
					reactionTime: everyReactionTime[i],
					RSVP: RSVP[i]
				};
			}

			await update(dbRef, updates);
		} catch (error) {
			console.error(error);
		}
	}
};
