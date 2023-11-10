import { ref, child, get } from "firebase/database";
import { db } from '$lib/firebase';

export async function load({ locals }) {
    const dbRef = ref(db);
    get(child(dbRef, 'users')).then((snapshot) => {
    if (snapshot.exists()) {
        console.log(snapshot.val());
    } else {
        console.log("No data available");
    }
    }).catch((error) => {
        console.error(error);
    });

    return {
        
    }
}