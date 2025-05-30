'use strict';

const express  = require('express'); // Web Application Framework
const cors     = require('cors');
const firebase = require('firebase-admin'); // Firebase services
const twilio   = require('twilio');
const axios    = require('axios');

// https://expressjs.com/en/resources/middleware/cors.html#configuring-cors
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();
app.use(cors(corsOptions)); // CORS middleware for extra security layer
app.use(express.json()); // JSON middleware for parsing json and match the Content-Type header

const serviceAccount = require('./db-firebase-admin.json');
const { use, StrictMode } = require('react');
firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount)
});
const db = firebase.firestore();
// Use database from Firestore service

async function getFirestoreDataByField(collection = '', document = '', field = '') {
  if (
    typeof collection !== "string" || typeof document !== "string" || typeof field !== "string" ||
    ! (collection && document && field)
  ) {
    return '';
  }

  // .data() will get a nasty data.accessCode.accessCode structure, .get(field) for data.accessCode
  let value = (await db.collection(collection).doc(document).get()).get(field) ?? '';
  if (! Object.keys(field).length) {
    value = '';
  }

  return value;
}

async function setFirestoreData(collection = '', document = '', fieldValueObject = {}) {
  if (
    typeof collection !== "string" || typeof document !== "string" || typeof fieldValueObject !== "object" ||
    ! (collection && document && Object.keys(fieldValueObject).length)
  ) {
    return;
  }

  db.collection(collection).doc(document).set(fieldValueObject);
}

const smsProvider = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// Use SMS service from Twilio

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random#getting_a_random_number_between_two_values
const generateAccessCode = () => Math.floor(100000 + Math.random() * 900000).toString();
// Got random 6-digits code

// Create new access code
app.post('/api/1.0/createNewAccessCode', async (req, res) => {
  const { phoneNumber } = req.body;
  if (! phoneNumber) {
    // Simple check
    res.status(400).send('Missing Phone Number');
  }

  try {
    const collection = 'accessCodes';
    const field      = 'accessCode';
    let accessCode   = await getFirestoreDataByField(collection, phoneNumber, field);
    if (! accessCode) {
      // Skip requirements after 1st code stored to save resource and bypass Twilio Rate Limit, "com.twilio.inventory.utils.exception.ValidationException: Trial accounts are not allowed to host numbers" and "You must upgrade your account to port phone numbers into Twilio."
      // Disable the if (and the localStorage) to test the normal logic

      accessCode = generateAccessCode();

      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer#property_definitions
      // Shorthand property { "accessCode": accessCode } into { accessCode }
      setFirestoreData(collection, phoneNumber, { accessCode });

      // https://www.twilio.com/docs/api/errors/21211
      // phoneNumber format: <+><2-digits country code><Vietnam 8-digits subscriber number including area code>
      // "from" and "to" cannot be the same
      // https://www.twilio.com/docs/errors/21659
      // "from" must be hosting number and in the same country as "to"
      // [NOTE]: I'm unable to test this logic because of Trial account
      await smsProvider.messages.create({
        body: `Your access code is ${accessCode}`,
        from: process.env.ACCESS_CODE_SMS_FROM,
        to: phoneNumber,
      });
      // Twilio sent SMS
    }

    res.status(200).send({ accessCode });
  } catch (error) {
    res.status(500).send('Error generating access code');
    console.log(error);
  }
});

// Validate access code
app.post('/api/1.0/validateAccessCode', async (req, res) => {
  const { phoneNumber, accessCode } = req.body;
  if (! (phoneNumber && accessCode)) {
    // Simple check
    res.status(400).send('Either missing Phone Number or Access Code');
  }

  try {
    const collection   = 'accessCodes';
    const field        = 'accessCode';
    const dbAccessCode = await getFirestoreDataByField(collection, phoneNumber, field);
    if (dbAccessCode && dbAccessCode === accessCode) {
      // Clear invalidate the data
      accessCode = "";
      setFirestoreData(collection, phoneNumber, { accessCode });
      res.status(200).send({ success: true });
    } else {
      res.status(400).send({ success: false });
    }
  } catch (error) {
    res.status(500).send('Error validating access code');
    console.log(error);
  }
});

// GET: Search GitHub users
app.get('/api/1.0/searchGithubUsers', async (req, res) => {
  const { q, page, per_page } = req.query;
  try {
    const response = await axios.get('https://api.github.com/search/users', {
      params: { q, page, per_page },
      headers: { Authorization: 'Bearer github_dummy_token' }, // Replace with real token
    });
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).send('Error searching GitHub users');
    console.log(error);
  }
});

// GET: Find GitHub user profile
app.get('/api/1.0/findGithubUserProfile', async (req, res) => {
  const { github_user_id } = req.query;
  try {
    const response = await axios.get(`https://api.github.com/users/${github_user_id}`, {
      headers: { Authorization: 'Bearer github_dummy_token' }, // Replace with real token
    });
    res.status(200).send(response.data);
  } catch (error) {
    res.status(500).send('Error fetching GitHub user profile');
    console.log(error);
  }
});

// POST: Like GitHub user
app.post('/api/1.0/likeGithubUser', async (req, res) => {
  const { phone_number, github_user_id } = req.body;
  try {
    const userRef = db.collection('users').doc(phone_number);
    const userDoc = await userRef.get();
    const userData = userDoc.exists ? userDoc.data() : { favorite_github_users: [] };
    if (!userData.favorite_github_users.includes(github_user_id)) {
      userData.favorite_github_users.push(github_user_id);
      await userRef.set(userData);
    }
    res.status(200).send();
  } catch (error) {
    res.status(500).send('Error liking GitHub user');
    console.log(error);
  }
});

// GET: Get user profile
app.get('/api/1.0/getUserProfile', async (req, res) => {
  const { phone_number } = req.query;
  try {
    const userDoc = await db.collection('users').doc(phone_number).get();
    if (!userDoc.exists) {
      return res.status(200).send({ favorite_github_users: [] });
    }
    const userData = userDoc.data();
    const favoriteUsers = await Promise.all(
      userData.favorite_github_users.map(async (id) => {
        const response = await axios.get(`https://api.github.com/users/${id}`, {
          headers: { Authorization: 'Bearer github_dummy_token' }, // Replace with real token
        });
        return response.data;
      })
    );
    res.status(200).send({ favorite_github_users: favoriteUsers });
  } catch (error) {
    res.status(500).send('Error fetching user profile');
    console.log(error);
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));