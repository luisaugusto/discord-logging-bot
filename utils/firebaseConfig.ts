import { config } from 'dotenv';
import { initializeApp } from 'firebase/app';
config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: 'discord-openai-bot.firebaseapp.com',
  projectId: 'discord-openai-bot',
  storageBucket: 'discord-openai-bot.appspot.com',
  messagingSenderId: '266588889166',
  appId: process.env.FIREBASE_APP_ID
};

export const app = initializeApp(firebaseConfig);
