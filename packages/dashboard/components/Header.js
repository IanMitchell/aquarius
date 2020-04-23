import React from 'react';

export default function Header({ onClick }) {
  return (
    <header className="header">
      <div className="menu-icon" onClick={onClick}>
        Icon
      </div>

      <h1>Aquarius</h1>

      <nav>
        <ul>
          <li>Home</li>
          <li>Commands</li>
          <li>Development</li>
          <li>Dashboard</li>
          <li>Sponsors</li>
          <li>Help</li>
        </ul>
      </nav>
    </header>
  );
}
