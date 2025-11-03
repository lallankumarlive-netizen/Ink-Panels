const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

admin.initializeApp();
const db = admin.firestore();

// Load SMTP config from functions config: firebase functions:config:set smtp.user="..." smtp.pass="..."
const SMTP_USER = functions.config().smtp && functions.config().smtp.user;
const SMTP_PASS = functions.config().smtp && functions.config().smtp.pass;

if (!SMTP_USER || !SMTP_PASS) {
  console.warn('SMTP credentials not configured. Set with `firebase functions:config:set smtp.user="..." smtp.pass="..."`');
}

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  }
});

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.sendOtp = functions.https.onCall(async (data, context) => {
  const { email, purpose } = data || {};
  if (!email) throw new functions.https.HttpsError('invalid-argument', 'Email is required');

  // Rate limiting (very simple): check last sent
  const recent = await db.collection('otp_verifications')
    .where('email', '==', email)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (!recent.empty) {
    const last = recent.docs[0].data();
    const now = Date.now();
    if (last.createdAt && last.createdAt.toMillis && (now - last.createdAt.toMillis()) < 60 * 1000) {
      throw new functions.https.HttpsError('resource-exhausted', 'Please wait before requesting a new code');
    }
  }

  const code = generateOtp();
  const salt = bcrypt.genSaltSync(10);
  const codeHash = bcrypt.hashSync(code, salt);
  const expiresAt = admin.firestore.Timestamp.fromMillis(Date.now() + 1000 * 60 * 10); // 10 minutes

  await db.collection('otp_verifications').add({
    email,
    purpose: purpose || 'register',
    codeHash,
    attempts: 0,
    used: false,
    createdAt: admin.firestore.Timestamp.now(),
    expiresAt
  });

  const mail = {
    from: SMTP_USER,
    to: email,
    subject: 'Your Ink Panels verification code',
    text: `Your verification code is ${code}. It expires in 10 minutes.`,
    html: `<p>Your verification code is <strong>${code}</strong>. It expires in 10 minutes.</p>`
  };

  try {
    await transporter.sendMail(mail);
    return { ok: true };
  } catch (err) {
    console.error('sendMail error', err);
    throw new functions.https.HttpsError('internal', 'Failed to send email');
  }
});

exports.verifyOtp = functions.https.onCall(async (data, context) => {
  const { email, code, username, password } = data || {};
  if (!email || !code) throw new functions.https.HttpsError('invalid-argument', 'Email and code are required');

  const q = await db.collection('otp_verifications')
    .where('email', '==', email)
    .where('used', '==', false)
    .orderBy('createdAt', 'desc')
    .limit(5)
    .get();

  if (q.empty) throw new functions.https.HttpsError('not-found', 'No verification code found');

  let matchedDoc = null;
  for (const doc of q.docs) {
    const d = doc.data();
    if (d.expiresAt && d.expiresAt.toMillis && d.expiresAt.toMillis() < Date.now()) continue; // expired
    const ok = bcrypt.compareSync(code, d.codeHash);
    if (ok) { matchedDoc = doc; break; }
  }

  if (!matchedDoc) {
    // increment attempts on the last doc
    const last = q.docs[0];
    await last.ref.update({ attempts: (last.data().attempts || 0) + 1 });
    throw new functions.https.HttpsError('invalid-argument', 'Invalid or expired code');
  }

  // mark used
  await matchedDoc.ref.update({ used: true });

  // Create or verify user via Admin SDK
  let userRecord;
  try {
    userRecord = await admin.auth().getUserByEmail(email);
    // existing user: mark verified and update displayName
    await admin.auth().updateUser(userRecord.uid, { emailVerified: true, displayName: username || userRecord.displayName || '' });
  } catch (err) {
    // not found -> create user (password required)
    if (!password) throw new functions.https.HttpsError('invalid-argument', 'Password required to create account');
    userRecord = await admin.auth().createUser({ email, emailVerified: true, password, displayName: username || '' });
  }

  // Write profile doc
  await db.collection('users').doc(userRecord.uid).set({
    email,
    username: username || userRecord.displayName || '',
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });

  // Create custom token to sign in client
  const customToken = await admin.auth().createCustomToken(userRecord.uid);
  return { ok: true, token: customToken, uid: userRecord.uid };
});
