import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// Initialize Firebase
const app = initializeApp ({
    apiKey: "AIzaSyAqbYxTjfEq2EDg74KIyX12Y38IEYNOcaY",
    authDomain: "poslix-dev.firebaseapp.com",
    projectId: "poslix-dev",
    storageBucket: "poslix-dev.appspot.com",
    messagingSenderId: "646241157490",
    appId: "1:646241157490:web:02020ba633446825dd5deb",
    measurementId: "G-D091K8TC2L"
});


// Firebase storage reference
const storage = getStorage(app);
export default storage;