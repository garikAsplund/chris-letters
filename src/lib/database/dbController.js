import { NUMBER_OF_TRIALS } from '$lib/logic/ConstantsAndHelpers';
import { things } from '$lib/stores/GameStore';
import { child, get, runTransaction, set, update } from 'firebase/database';
import { dbRef } from './firebase';
import { prolificStore } from '$lib/stores/prolificStore';

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

	async setScreenParams(userId, refreshRate, innerWidth, innerHeight) {
		try {
			await update(child(dbRef, `users/${userId}`), {
				refreshRate: refreshRate,
				innerWidth: innerWidth,
				innerHeight: innerHeight
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

	async writeParticipantData(userId, gender, handedness, age, prolificID) {
		try {
			await update(child(dbRef, `users/${userId}`), {
				gender,
				age,
				handedness,
				prolificID,
			});
		} catch (error) {
			console.error(error);
		}
	},

	async writeParticipantProblems(userId, problems) {
		try {
			await update(child(dbRef, `users/${userId}`), {
				problems
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
		targetColor,
		streamDuration
	) {
		try {
			const updates = {};

			updates[`AB/${userId}/session${sessionNumber}/time`] = Date.now();

			for (let i = 0; i < NUMBER_OF_TRIALS; i++) {
				updates[`AB/${userId}/session${sessionNumber}/${i + 1}`] = {
					targets: everyTarget[i],
					responses: everyGuess[i],
					accuracy: everyAccuracy[i],
					reactionTime: everyReactionTime[i],
					RSVP: RSVP[i],
					t1Position: t1Position[i],
					t2Position: `+${t2Position[i]}`,
					targetColor,
					streamDuration: streamDuration[i]
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
		targetColor,
		streamDuration
	) {
		try {
			const updates = {};

			updates[`CC/${userId}/session${sessionNumber}/time`] = Date.now();

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
					targetColor,
					streamDuration: streamDuration[i]
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
		sessionNumber,
		RSVP,
		surprise,
		targetPosition,
		targetColor,
		streamDuration,
		surprisePath
	) {
		try {
			const updates = {};

			let pathIndex = 0;

			updates[`SiB/${userId}/session${sessionNumber}/time`] = Date.now();

			for (let i = 0; i < NUMBER_OF_TRIALS; i++) {
				let surprisePathSingle = 'None';
				if (surprise[i].includes(true)) {
					surprisePathSingle = surprisePath[pathIndex++];
				}

				updates[`SiB/${userId}/session${sessionNumber}/${i + 1}`] = {
					target: everyTarget[i],
					targetResponse: everyGuess[i],
					accuracy: everyAccuracy[i],
					reactionTime: everyReactionTime[i],
					RSVP: RSVP[i],
					surprise: surprise[i].includes(true) ? surprise[i].indexOf(true) : 'None',
					targetPosition: targetPosition[i],
					targetColor,
					streamDuration: streamDuration[i],
					surprisePath: surprisePathSingle
				};
			}

			await update(dbRef, updates);
			console.log('SiB data written');
		} catch (error) {
			console.error(error);
		}
	},

	async writeVAB(
		userId,
		everyTarget,
		everyGuess,
		everyAccuracy,
		everyReactionTime,
		sessionNumber,
		RSVP,
		surprise,
		targetPosition,
		streamDuration,
		numberOfTrials,
		everyProbeGuess,
		everyProbeAccuracy,
		blockCount
	) {
		try {
			const updates = {};

			updates[`VAB/${userId}/session${sessionNumber}/block${blockCount}/time`] = Date.now();

			for (let i = 0; i < numberOfTrials; i++) {
				updates[`VAB/${userId}/session${sessionNumber}/block${blockCount}/${i + 1}`] = {
					target: everyTarget[i],
					targetResponse: everyGuess[i],
					probe: RSVP[i].includes('X') ? true : false,
					probeResponse: everyProbeGuess[i],
					targetAccuracy: everyAccuracy[i],
					probeAccuracy: everyProbeAccuracy[i],
					reactionTime: everyReactionTime[i],
					RSVP: RSVP[i],
					surprise: surprise[i].includes(true) ? surprise[i].indexOf(true) : 'None',
					targetPosition: targetPosition[i],
					probePosition: RSVP[i].includes('X') ? RSVP[i].indexOf('X') : 'None',
					streamDuration: streamDuration[i]
				};
			}

			await update(dbRef, updates);
		} catch (error) {
			console.error(error);
		}
	},

	async readData(trialType) {
		try {
			const snapshot = await get(child(dbRef, trialType));
			if (snapshot.exists()) {
				const data = snapshot.val();
				return data;
			} else {
				console.log('No data available');
			}
		} catch (error) {
			console.error(error);
		}
	}
};
