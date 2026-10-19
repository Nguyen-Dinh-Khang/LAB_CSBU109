import React from 'react';

export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar-container">
      <input
        type="text"
        className="search-input"
        placeholder="Search posts..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}