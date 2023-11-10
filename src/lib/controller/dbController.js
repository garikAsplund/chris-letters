import { child, get } from "firebase/database";
import { dbRef } from '$lib/firebase';
    
export const getUsers = {
    getAll() {
        get(child(dbRef, 'users')).then((snapshot) => {
            if (snapshot.exists()) {
                console.log(snapshot.val());
                return snapshot.val();
            } else {
                console.log("No data available");
            }
            }).catch((error) => {
                console.error(error);
            });
    }    
}