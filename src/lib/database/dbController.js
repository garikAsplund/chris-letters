import { dbRef  } from "./firebase";
import { child, get, set } from 'firebase/database';
import { things } from "$lib/stores/gameStore";

export const dbController = {
    getAllUsers() {
        get(child(dbRef, 'users'))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    things.set(data); // Use const data instead of $things
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

    writeTrialData() {
        // Your implementation for writing trial data
    }
}
