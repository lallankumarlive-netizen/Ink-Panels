OTP email flow (Cloud Functions)
================================

This project includes Firebase Cloud Functions to support an email OTP (numeric code) verification flow using Gmail SMTP.

Files added:
- functions/index.js — sends OTP (`sendOtp`) and verifies OTP (`verifyOtp`), creates/verifies Firebase user and returns a custom token.
- functions/package.json — dependencies for functions (nodemailer, bcryptjs, firebase-admin, firebase-functions)

Setup & deploy
--------------
1. Install function deps (in `functions/`):
   cd functions
   npm install

2. Set SMTP credentials (use Gmail App Password) via firebase CLI:
   firebase functions:config:set smtp.user="your@gmail.com" smtp.pass="your-app-password"

3. Deploy functions:
   firebase deploy --only functions

Usage from client (in-browser)
-----------------------------
We use callable functions. After deploying, your client (already using Firebase) can call:

// send OTP
const sendOtp = firebase.functions().httpsCallable('sendOtp');
await sendOtp({ email, purpose: 'register' });

// verify OTP (server returns a custom token)
const verifyOtp = firebase.functions().httpsCallable('verifyOtp');
const res = await verifyOtp({ email, code, username, password });
const customToken = res.data.token;
await firebase.auth().signInWithCustomToken(customToken);

Security notes
--------------
- Store SMTP credentials using `firebase functions:config:set` and DO NOT commit them.
- Use a Gmail App Password (2FA enabled) for SMTP.
- Set Firestore rules so clients cannot list OTP documents. Cloud Functions uses Admin SDK which bypasses rules.
- Implement rate-limits and TTL (10 min) for OTPs; this function stores `expiresAt` and `used` fields.
