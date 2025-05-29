const express = require('express'); // Web Application Framework
const cors = require('cors');
const admin = require('firebase-admin');
const twilio = require('twilio');
const axios = require('axios');

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

// Initialize Firebase Admin with dummy credentials
const serviceAccount = require('./db-firebase-admin.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Initialize Twilio with dummy credentials
const twilioClient = twilio('AC_dummy_account_sid', 'dummy_auth_token');

// Generate random 6-digit code
const generateAccessCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// POST: Create new access code
app.post('/api/1.0/createNewAccessCode', async (req, res) => {
  const { phoneNumber } = req.body;
  if (! phoneNumber) {
    res.status(400).send('Missing Phone Number');
  }

  let accessCode = (await db.collection('accessCodes').doc(phoneNumber).get()).get('accessCode');
  try {
    if (! accessCode) {
      // Skip requirements after 1st code stored to save resource and bypass Twilio Rate Limit.
      accessCode = generateAccessCode();

      // Save to Firestore
      await db.collection('accessCodes').doc(phoneNumber).set({ accessCode });

      // Send SMS via Twilio
      await twilioClient.messages.create({
        body: `Your access code is ${accessCode}`,
        from: '+1234567890', // Dummy Twilio number
        to: phoneNumber,
      });
    }

    res.status(200).send({ accessCode });
  } catch (error) {
    res.status(500).send('Error generating access code');
    console.log(error);
  }
});

// POST: Validate access code
app.post('/api/1.0/validateAccessCode', async (req, res) => {
  const { phoneNumber, accessCode } = req.body;
  if ( ! (phoneNumber && accessCode) ) {
    res.status(400).send('Either missing Phone Number or Access Code');
  }
  try {
    const dbAccessCode = (await db.collection('accessCodes').doc(phoneNumber).get()).get('accessCode');
    if (dbAccessCode && dbAccessCode === accessCode) {
      // Clear access code after validation
      await db.collection('accessCodes').doc(phoneNumber).set({ accessCode: '' });
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