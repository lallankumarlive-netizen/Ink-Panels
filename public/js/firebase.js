// Firebase initializer (compat SDK expected to be loaded before this file)
// Replace the firebaseConfig object below with your project's credentials.
const firebaseConfig = {
    apiKey: "REPLACE_WITH_YOUR_API_KEY",
    authDomain: "REPLACE_WITH_YOUR_PROJECT.firebaseapp.com",
    projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
    storageBucket: "REPLACE_WITH_YOUR_PROJECT.appspot.com",
    messagingSenderId: "REPLACE_WITH_SENDER_ID",
    appId: "REPLACE_WITH_APP_ID"
};

if (typeof firebase !== 'undefined' && firebase.apps && !firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Expose convenience globals
window.firebaseAuth = firebase.auth();
window.firebaseFirestore = firebase.firestore();

// Helper to get current ID token (returns null if no signed-in user)
window.getIdToken = async function() {
    const user = firebaseAuth.currentUser;
    if (!user) return null;
    return await user.getIdToken(/* forceRefresh */ true);
};

// Helper to sign out
window.signOutFirebase = async function() {
    try {
        await firebaseAuth.signOut();
    } catch (e) {
        console.warn('Firebase signOut failed', e);
    }
};
