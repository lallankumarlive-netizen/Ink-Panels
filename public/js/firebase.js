// Firebase initializer (compat SDK expected to be loaded before this file)
// Config injected from project settings (provided by user)
const firebaseConfig = {
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    apiKey: "AIzaSyCEELyHP38BjY5iZVJpDTV1UCG-IiFVUKc",
    authDomain: "ink-panels.firebaseapp.com",
    projectId: "ink-panels",
    storageBucket: "ink-panels.firebasestorage.app",
    messagingSenderId: "5655252257",
    appId: "1:5655252257:web:60d86853910f0143f40260",
    measurementId: "G-5QFN5J5X5S"
};

if (typeof firebase !== 'undefined') {
    try {
        if (!firebase.apps || !firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
    } catch (err) {
        console.warn('Firebase initialize error', err);
    }
}

// Expose convenience globals (ensure SDKs are loaded)
window.firebaseAuth = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth() : null;
window.firebaseFirestore = (typeof firebase !== 'undefined' && firebase.firestore) ? firebase.firestore() : null;

// Helper to get current ID token (returns null if no signed-in user)
window.getIdToken = async function() {
    if (!window.firebaseAuth) return null;
    const user = firebaseAuth.currentUser;
    if (!user) return null;
    return await user.getIdToken(/* forceRefresh */ true);
};

// Helper to sign out
window.signOutFirebase = async function() {
    if (!window.firebaseAuth) return;
    try {
        await firebaseAuth.signOut();
    } catch (e) {
        console.warn('Firebase signOut failed', e);
    }
};
