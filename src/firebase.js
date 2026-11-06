import {initializeApp} from 'firebase/app';import {getAuth} from 'firebase/auth';import {getFirestore} from 'firebase/firestore';
const e=import.meta.env,c={apiKey:e.VITE_FB_API_KEY,authDomain:e.VITE_FB_AUTH_DOMAIN,projectId:e.VITE_FB_PROJECT_ID,appId:e.VITE_FB_APP_ID};
export const OK=!!c.apiKey;
const app=OK?initializeApp(c):null;
export const auth=OK?getAuth(app):null,db=OK?getFirestore(app):null;
if(auth)auth.languageCode='id';
