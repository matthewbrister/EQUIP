# Firebase setup

## 1. Create the Firebase project

1. Create or select a Firebase project.
2. Enable Google Authentication under Authentication > Sign-in method.
3. Create a Web app in Project settings.
4. Copy the web app configuration values.

## 2. Configure OAuth domains

In Authentication > Settings > Authorized domains, add:

- `localhost`
- Your GitHub Pages domain, for example `YOUR_USERNAME.github.io`

For local Vite development, also add `127.0.0.1` if Firebase does not accept it automatically.

## 3. Create local environment values

Copy `.env.example` to `.env.local` and fill in the Firebase web configuration values.

Restart Vite after changing environment variables.

## 4. Configure Firestore

Create a Firestore database and publish the current `firebase/firestore.rules` in **Firestore Database > Rules**. The app creates these documents as data is added:

- `users/{uid}`: account profile and role
- `programs/{programId}`: program details and approval state
- `programJoinCodeRecords/{programId}` and `programCodeIndex/{code}`: restricted program join-code lookup
- `programs/{programId}/periods/{periodId}`: class periods
- `programs/{programId}/roster/{studentUid}`: membership
- `programs/{programId}/technologies/{technologyId}`: inventory
- `programs/{programId}/projects/{projectId}`: student projects and review state

Collections are per-program so rosters and project history are not constrained by Firestore's per-document size limit. Rules allow public reads only for approved programs and explicitly public inventory/projects; student, facilitator, and administrator access is scoped by their account and program.

Existing browser-local program data is **not imported**. New cloud workspaces begin empty. Existing localStorage values are left in the browser but are no longer read by the application.

## 5. Account deletion on the Firebase free plan

This setup uses Firebase Authentication and Firestore only. It does not use Cloud Functions and does not require the Blaze plan. Firebase Spark usage limits still apply.

When a user confirms deletion, the app reauthenticates with Google, removes the Firestore profile and (for students) roster membership in a batch, and then deletes the Firebase Authentication account. Submitted projects and their Cloudinary images are intentionally preserved. If Authentication deletion fails, EQUIP tries to restore the profile; a student may need to rejoin the program using its access code. Facilitators who own a program cannot delete their account until its ownership is transferred or the program is archived.

The client-side deletion permissions depend on the current Firestore rules. Publish `firebase/firestore.rules` before enabling account deletion in production.

## 6. Configure Cloudinary image uploads

1. Create a Cloudinary account and find your **Cloud name** in the Cloudinary dashboard.
2. In **Settings > Upload**, create an upload preset with **Signing Mode: Unsigned**.
3. Restrict the preset to image formats you accept and set an upload size limit (the app rejects files larger than 10 MB).
4. Copy the cloud name and preset name into `.env.local`:

   ```dotenv
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
   ```

5. Restart Vite. EQUIP uploads images directly to Cloudinary and stores only each returned secure URL in Firestore. Do not put a Cloudinary API secret in client-side environment variables.

## 7. Website administrator

The Google account `matthewbristergaming@gmail.com` is the only website administrator. Sign in with that Google account; EQUIP recognizes its verified email and opens the Website Manager portal. Admin is not an account type users can select during signup.

The Firestore rules also allow only that verified email to list facilitator profiles, approve facilitators, and publish programs. In the Firebase Console, select the `equip-web` project, open **Firestore Database > Rules**, replace the rules with the current contents of `firebase/firestore.rules`, and click **Publish**. The email in the app and rules must remain the same if the administrator account changes.

## 8. Google sign-in

EQUIP uses Firebase Google Authentication. Firebase manages the OAuth flow and stores the Google name, email, and profile picture. EQUIP does not collect or store passwords.

## 9. GitHub Pages OAuth

The Firebase authorized-domain and OAuth redirect configuration must include the deployed GitHub Pages domain. Add the production site URL to the Google Cloud OAuth app only if Google Console still reports a redirect mismatch.

## 10. Configure the GitHub Pages build

The Pages build runs on GitHub Actions, so it cannot read your local `.env.local`. In the repository, open **Settings > Secrets and variables > Actions > New repository secret** and add the following secrets using the matching values from your local `.env.local`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

These are client-side Firebase configuration and an unsigned Cloudinary upload preset; their values are included in the public site bundle. GitHub Secrets keep them out of the repository and build logs, but do not make them private from site visitors. Do not add a Firebase service-account key, Cloudinary API secret, or other server credential.

The deployment workflow checks that all eight secrets are present before building, so it will not publish a site with missing configuration. After adding them, open **Actions > Deploy to GitHub Pages > Run workflow** and run it on `main`. The Firebase Authentication authorized domains must also include `matthewbrister.github.io`.
