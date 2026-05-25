import React from 'react';
import './Avatar.css';
import { STORAGE_BASE_URL } from '../../../apiConfig';

const Avatar = ({ user, size = 'md', className = '' }) => {
  // Function to extract initials from first and last name
  const getInitials = (name) => {
    if (!name) return 'U';
    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const isLoggedIn = !!user;
  const profilePic = user?.profile_picture || user?.profile_pic;
  const hasImage = isLoggedIn && profilePic && profilePic !== '';

  // Construct URL - handle cases where it might be a full URL already or just a path
  const getImageUrl = (path) => {
    if (!path) return '';
    let url = path;
    if (!url.startsWith('http')) {
      url = `${STORAGE_BASE_URL}/${url}`;
    }
    // Dynamic global host resolution
    const backendRoot = STORAGE_BASE_URL.replace('/storage', '');
    url = url.replace('http://127.0.0.1:8000', backendRoot)
             .replace('http://localhost:8000', backendRoot)
             .replace('http://localhost', backendRoot);
             
    // Add dynamic cache-busting query to refresh image immediately when user uploads a new one
    return `${url}?t=${Date.now()}`;
  };

  return (
    <div className={`avatar-container avatar-${size} ${className}`} title={isLoggedIn ? (user?.full_name || user?.email) : 'Guest'}>
      {!isLoggedIn ? (
        <div className="avatar-guest">
          <svg viewBox="0 0 24 24" width="70%" height="70%" fill="#94a3b8">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
      ) : (
        <>
          {hasImage ? (
            <img
              src={getImageUrl(profilePic)}
              alt={user.full_name || 'User'}
              className="avatar-img"
              onError={(e) => {
                e.target.style.display = 'none';
                // Show initials if image fails to load
                const initialsDiv = e.target.parentElement.querySelector('.avatar-initials');
                if (initialsDiv) initialsDiv.style.display = 'flex';
              }}
            />
          ) : null}

          <div className="avatar-initials" style={{ display: hasImage ? 'none' : 'flex' }}>
            {getInitials(user?.full_name || user?.email)}
          </div>
        </>
      )}
    </div>
  );
};

export default Avatar;
