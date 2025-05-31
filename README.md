# React Hello Application

## Terms

### - Express

A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.

### - Firebase

BaaS (Backend As A Service) with a set of services that help building apps.

#### -- Firestore

A flexible, scalable database for mobile device, web, and server development from Firebase and Google Cloud.

## Project Structure
- `hello/src/`: React front-end
  - `component/`: React components (`AuthForm.js`, `SearchPage.js`)
  - `App.js`: Main app with routing
  - `backend/`: Express back-end
  - `backend/index.js`: API endpoints
- Screenshots: Located in `react/` folder

## Setup Instructions
1. **Front-End**:
   - Navigate to `hello/`
   - Run `npm install`
   - Run `npm start` to start the React app on `http://localhost:3000`
1. **Firebase**:
   - Set up a Firestore database with collections: `accessCodes` and `users`
   - `https://console.firebase.google.com/u/1/project/<Project ID>/settings/serviceaccounts/adminsdk`
   - Select Node.js (default)
   - Click "Generate new private key" button
   - Put the downloaded .json into `hello/src/backend/db-firebase-admin.json`
1. **Twilio**:
   - Update Twilio credentials in `hello/src/backend/.env`
1. **GitHub**:
   - https://github.com/settings/personal-access-tokens
   - Set GitHub API token in `hello/src/backend/.env`
1. **Back-End**:
   - Navigate to `hello/src/backend/`
   - Run `npm install`
   - Run `npm run dev` to start the server on `http://localhost:5000`

## Features
- Phone number authentication with 6-digit access code via SMS
- GitHub user search with pagination
- Like GitHub profiles, stored in Firestore
- Profile modal showing phone number and liked users
- Persistent liked profiles via Firestore

## Screenshots
- `auth_form.png`: Authentication form
- `search_page.png`: GitHub search page
- `profile_modal.png`: User profile modal

## Notes
- Replace with authorized credentials for full functionality.
- Ensure CORS is enabled for local development.