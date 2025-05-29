import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Search page with GitHub user search and pagination
const PageSearch = ({ phoneNumber }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [showProfile, setShowProfile] = useState(false);
  const [likedUsers, setLikedUsers] = useState([]);

  // Fetch GitHub users
  const searchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/searchGithubUsers', {
        params: { q: searchTerm, page, per_page: perPage },
      });
      setUsers(response.data.items);
    } catch (error) {
      console.error('Error searching GitHub users:', error);
    }
  };

  // Fetch liked users for profile modal
  const fetchLikedUsers = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/getUserProfile', {
        params: { phone_number: phoneNumber },
      });
      setLikedUsers(response.data.favorite_github_users);
    } catch (error) {
      console.error('Error fetching liked users:', error);
    }
  };

  // Handle like button click
  const handleLike = async (githubUserId) => {
    try {
      await axios.post('http://localhost:5000/api/likeGithubUser', {
        phone_number: phoneNumber,
        github_user_id: githubUserId,
      });
      fetchLikedUsers(); // Refresh liked users
    } catch (error) {
      console.error('Error liking user:', error);
    }
  };

  useEffect(() => {
    if (searchTerm) searchUsers();
    fetchLikedUsers();
  }, [page, perPage, searchTerm]);

  return (
    <div>
      <nav>
        <input
          type="text"
          placeholder="Search GitHub Users"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={() => setShowProfile(true)}>Profile</button>
      </nav>
      <div>
        <label>
          Results per page:
          <select value={perPage} onChange={(e) => setPerPage(Number(e.target.value))}>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
        </label>
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page}</span>
        <button onClick={() => setPage(page + 1)}>Next</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Avatar</th>
            <th>Profile URL</th>
            <th>Public Repos</th>
            <th>Followers</th>
            <th>Like</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.login}</td>
              <td>
                <img src={user.avatar_url} alt="avatar" width="50" />
              </td>
              <td>
                <a href={user.html_url} target="_blank" rel="noopener noreferrer">
                  Profile
                </a>
              </td>
              <td>{user.public_repos || 'N/A'}</td>
              <td>{user.followers || 'N/A'}</td>
              <td>
                <button
                  onClick={() => handleLike(user.id)}
                  style={{ color: likedUsers.some((u) => u.id === user.id) ? 'red' : 'black' }}
                >
                  ♥
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showProfile && (
        <div className="modal">
          <h2>Profile</h2>
          <p>Phone: {phoneNumber}</p>
          <h3>Liked Users</h3>
          <ul>
            {likedUsers.map((user) => (
              <li key={user.id}>
                {user.login} (ID: {user.id})
              </li>
            ))}
          </ul>
          <button onClick={() => setShowProfile(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default PageSearch;