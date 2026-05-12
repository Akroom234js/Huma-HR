import React from 'react';
import './Avatar.css';

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

  const profilePic = user?.profile_picture || user?.profile_pic;
  const hasImage = profilePic && profilePic !== '';

  // Construct URL - handle cases where it might be a full URL already or just a path
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:8000/storage/${path}`;
  };

  return (
    <div className={`avatar-container avatar-${size} ${className}`} title={user?.full_name || user?.email}>
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
    </div>
  );
};

export default Avatar;
