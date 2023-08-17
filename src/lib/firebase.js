import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyDiauRrelcJu1GuYZ5Fqz6cz2y0LLv3C3g",
    authDomain: "chris-letters.firebaseapp.com",
    databaseURL: "https://chris-letters-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "chris-letters",
    storageBucket: "chris-letters.appspot.com",
    messagingSenderId: "867592075139",
    appId: "1:867592075139:web:bc8cfdcd4d74bd0a2668b6",
    measurementId: "G-3SEHN30EF8"
};

const app = initializeApp(firebaseConfig);

export default app;
