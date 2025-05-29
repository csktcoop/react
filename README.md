# Terms

## Express

A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.

## Firebase

BaaS (Backend As A Service) with a set of services that help building apps.

### Firestore

A flexible, scalable database for mobile device, web, and server development from Firebase and Google Cloud.


# React Hello Application

## Project Structure
- `react/`: React front-end
  - `src/component/`: React components (`AuthForm.js`, `SearchPage.js`)
  - `src/App.js`: Main app with routing
  - `src/backend/`: Express back-end
  - `src/backend/index.js`: API endpoints
- Screenshots: Located in `screenshots/` folder

## Setup Instructions
1. **Front-End**:
   - Navigate to `react/`
   - Run `npm install`
   - Run `npm start` to start the React app on `http://localhost:3000`
1. **Firebase**:
   - Set up a Firestore database with collections: `accessCodes` and `users`
   - https://console.firebase.google.com/u/1/project/<Project ID>/settings/serviceaccounts/adminsdk
   - Select Node.js (default)
   - Click "Generate new private key" button
   - Put the downloaded .json into `react/src/backend/db-firebase-admin.json`
1. **Twilio**:
   - Update Twilio credentials in `react/src/backend/index.js`
1. **GitHub**:
   - Replace GitHub API token in `react/src/backend/index.js`
1. **Back-End**:
   - Navigate to `react/src/backend/`
   - Run `npm install`
   - Replace Firebase and Twilio credentials in `index.js`
   - Replace GitHub API token in `index.js`
   - Run `node index.js` to start the server on `http://localhost:5000`

## Features
- Phone number authentication with 6-digit access code via SMS
- GitHub user search with pagination
- Like GitHub profiles, stored in Firestore
- Profile modal showing phone number and liked users
- Persistent liked profiles via Firestore

## Screenshots
- `screenshots/auth_form.png`: Authentication form
- `screenshots/search_page.png`: GitHub search page
- `screenshots/profile_modal.png`: User profile modal

## Notes
- Replace with authorized credentials for full functionality.
- Ensure CORS is enabled for local development.