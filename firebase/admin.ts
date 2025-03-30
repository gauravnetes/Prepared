import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";


const initFirebaseAdmin = () => {
    const apps = getApps(); 

    // making these checks so that we don't initialize firebase admin more than once in dev and produciton. Only one instance of firebase sdk is created 
    if (!apps.length) {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID, 
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL, 
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
            })
        })
    }

    return {
        auth: getAuth(), 
        db: getFirestore()
    }
}

export const { auth, db } = initFirebaseAdmin()