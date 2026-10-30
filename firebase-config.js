// Digital Media Academy: sign-in settings.
//
// Accounts are stored by Firebase (a free service from Google), because this website has no server of its own.
// To switch accounts on:
//   1. Create a free project at console.firebase.google.com
//   2. Add a "Web app" to it, and copy the settings Firebase shows you
//   3. Paste them below, replacing the PASTE_... values
//   4. In Firebase, open Build > Authentication > Sign-in method and turn on "Email/Password" (and "Google" if you want it)
//   5. In Authentication > Settings > Authorized domains, add every address people use to open this site
//      (for example digitalmediaacademy861.github.io and digital-media-academy.godswilludo90.workers.dev)
//
// These values are meant to be public. They are not passwords.

export const firebaseConfig = {
  apiKey: "AIzaSyCGvv7-Xbb7cuELw1eVBFSzmpA6RKcadLs",
  authDomain: "digital-media-academy.firebaseapp.com",
  projectId: "digital-media-academy",
  storageBucket: "digital-media-academy.firebasestorage.app",
  messagingSenderId: "672944573181",
  appId: "1:672944573181:web:61afe5f238649d57c74c94"
};
