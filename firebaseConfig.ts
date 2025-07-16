import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCgXbrSveQGqaE09gUz-eCXLBQMuIaZugA",
  authDomain: "glamora-user.firebaseapp.com",
  projectId: "glamora-user",
  storageBucket: "glamora-user.firebasestorage.app",
  messagingSenderId: "959322395563",
  appId: "1:959322395563:web:325660a42af34329d3f8ee",
  measurementId: "G-SFLSZQ3SNH"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
