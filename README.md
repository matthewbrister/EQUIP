# EQUIP

**EAST Quick Utility & Inventory Platform** (EQUIP) is a web application concept for helping EAST programs organize their people, equipment, and project work. It brings facilitator and student workflows together with a public program directory and a manager review area.

## Project goals

EQUIP is intended to:

- Give facilitators a place to describe their EAST program and organize its technology inventory.
- Let facilitators manage class periods and student rosters, and share a program access code with students.
- Give students a program workspace where they can find technology information and submit project drafts.
- Support facilitator review of student project submissions before projects are shown publicly.
- Provide a public directory for approved programs and, when a program chooses, its technology and projects.
- Require website manager approval before a facilitator can create a program.
- Require website manager review before a newly created program is published.
- Keep account sign-in simple and tied to Google, without collecting passwords.

## How it works

### Application structure

The project is a single-page application built with React and Vite. `src/App.jsx` owns the current page, navigation, sign-in state, and role-based route guards. The page components in `src/views/` implement the landing page, Google sign-in/setup, student and facilitator workspaces, public directory, and manager portal. Shared navigation, dialogs, and reusable UI live in `src/components/`.

### Sign-in and account setup

1. A user signs in with Google through Firebase Authentication. EQUIP does not provide password fields or store passwords.
2. Firebase reports the signed-in user to the app. The app reads or initializes that user's Firestore profile at `users/{uid}`.
3. A new user chooses Student or Facilitator. Students also choose a grade. There is no public manager/admin signup choice.
4. The selected role controls the app's navigation. Students without a program are asked for an access code; facilitators wait for manager approval; the administrator goes to the manager portal.

The single administrator is the verified Google account `matthewbristergaming@gmail.com`. The app recognizes the verified email, and the Firestore rules separately restrict administrative profile listing and facilitator approval actions to that account. The same email must be kept in sync in `src/lib/firebase.js` and `firebase/firestore.rules`.

### Facilitator and student workflows

- A new facilitator profile is saved with a pending approval status. Once approved, the facilitator can create an EAST program.
- A new program starts as a draft for manager review. Facilitators can configure its location and contact details, class periods, technology inventory, and student work.
- The program has an access code that students use to join its workspace. Student membership, grade, and period assignment are associated with that program.
- Students can submit project drafts and revise/resubmit them after facilitator feedback. Facilitators can review those submissions; approved work can appear in the public directory if the program enables public project visibility.
- The public directory displays approved programs and respects each program's technology/project visibility settings.

## Data and persistence

Firebase Authentication handles Google sign-in. Firestore stores account profiles and application data. Account profiles contain identity and setup fields such as name, email, photo URL, role, grade, facilitator approval status, program association, and timestamps. Program details are stored separately from their periods, roster entries, inventory items, and projects in Firestore subcollections. Firestore rules scope reads and writes by role and program, and prevent regular users from granting themselves privileges or approving facilitators.

Program records, inventory, rosters, class periods, student projects, and their approval states are shared through Firestore. Program access codes are stored in a restricted code index rather than public program documents. Existing browser-local workspace records are not imported; the new cloud workspace starts empty. Interface preferences remain in browser `localStorage`.

User-uploaded program, equipment, and project images are sent to Cloudinary. EQUIP saves the returned secure URLs in Firestore rather than storing image files in Firebase. Google profile photos continue to use the URL supplied by Google.

Students and facilitators without an active program can delete their account from Preferences after reauthenticating with Google. The client removes the user's Firestore profile and any student roster membership, then deletes the Firebase Authentication account. Submitted projects and their images are preserved. If Authentication deletion fails, EQUIP attempts to restore the profile; the student may need to rejoin their program. Facilitators who own a program must arrange a transfer or archive with the administrator first. This uses Firebase Authentication and Firestore only; it does not require Cloud Functions or a Firebase Blaze plan.

For a fuller account-field inventory, see [ACCOUNT_DATA_AUDIT.md](./ACCOUNT_DATA_AUDIT.md). For Firebase setup and Firestore rule deployment, see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md).

## Run locally

Requirements: Node.js and npm.

```sh
npm install
npm run dev
```

To enable the application, copy `.env.example` to `.env.local`, fill in the Firebase web app configuration and Cloudinary cloud name/unsigned upload preset, enable Google as a Firebase Authentication provider, and create a Firestore database. Restart the Vite development server after editing environment variables. Publish `firebase/firestore.rules` to the Firestore database in the matching Firebase project. See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for console and authorized-domain steps.

## Build and checks

```sh
npm run build
npm run preview
npm run lint
```

## Current scope and next stage

EQUIP has Google sign-in, Firestore-backed account profiles and program data, role-aware screens, administrator-only facilitator and program approvals, and client-side account deletion. Cloudinary hosts uploaded images. Deployment requires publishing the Firestore rules and providing valid Firebase and Cloudinary environment values. This Firebase setup uses Spark-compatible services and is subject to their usage quotas.
