import { useState } from 'react';
import axios from 'axios';

const backendApiUri = 'http://localhost:5000/api/1.0/';

// Form for phone number and access code submission
const FormAuth = ({ setAuthenticated }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [message, setMessage] = useState('');

  // Handle phone number submission
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    try {
      const xhr = await axios.post(backendApiUri + 'createNewAccessCode', { phoneNumber });
      const theAccessCode = xhr.data.accessCode ?? '';
      if (theAccessCode) {
        setMessage('Due to limited access to SMS Provider, the Access code is ' + theAccessCode);
      } else {
        setMessage('Access code sent to your phone.');
      }
    } catch (error) {
      setMessage('Error sending access code.');
    }
  };

  // Handle access code validation
  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(backendApiUri + 'validateAccessCode', {
        phoneNumber,
        accessCode,
      });
      if (response.data.success) {
        localStorage.setItem('phoneNumber', phoneNumber); // Save phone number to local storage
        setAuthenticated(true);
        setMessage('Authentication successful!');
      } else {
        setMessage('Invalid access code.');
      }
    } catch (error) {
      setMessage('Error validating access code.');
    }
  };

  return (
    <div>
      <h2>Authentication</h2>
      <div className="flex flex-col items-start gap-4 p-4 max-w-xs">
        <input
          name="phoneNumber"
          placeholder="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        <button onClick={handlePhoneSubmit}>Send Access Code</button>
      </div>
      <div className="flex flex-col items-start gap-4 p-4 max-w-xs">
        <input
          type="text"
          placeholder="Access Code"
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value)}
          required
        />
        <button onClick={handleCodeSubmit}>Validate Code</button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
};

// export default <DisplayNameInDevToolsToLocateTheFile> https://react.dev/learn/importing-and-exporting-components#exporting-and-importing-a-component
export default FormAuth;
