import { dbRef  } from "./firebase";
import { child, get, set, update } from 'firebase/database';
import ShortUniqueId from 'short-unique-id';
import { things } from "$lib/stores/gameStore";

export const dbController = {
    getAllUsers() {
        get(child(dbRef, 'users'))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    things.set(data);
                } else {
                    console.log('No data available');
                }
            })
            .catch((error) => {
                console.error(error);
            });
    },
    
    changeAdminStatus(userId, adminStatus) {
        set(child(dbRef, `users/${userId}/admin`), !adminStatus)
            .then(() => {
                things.update(users => {
                    users[userId].admin = !adminStatus;
                    return users;
                });
            })
            .catch((error) => {
                console.error(error);
            });
    },

    writeParticipantData(userId, gender, handedness, age, problemDescription) {
        update(child(dbRef, `users/${userId}`), {
            gender: gender,
            age: age,
            handedness: handedness,
            problemDescription: problemDescription,
        });
    },

    writeTrialData(userId, trialType, everyTarget, everyGuess, everyAccuracy, everyReactionTime) {
            const uid = new ShortUniqueId();
            const trialId = uid();
    
            set(child(dbRef, `blocks/${userId}/${trialId}`), {
                trialType: trialType,
                targets: everyTarget,
                guesses: everyGuess,
                accuracy: everyAccuracy,
                reactionTime: everyReactionTime
            });
        }
}