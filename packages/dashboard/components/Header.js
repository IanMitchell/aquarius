import classnames from 'classnames';
import React, { useState } from 'react';

export default function Header() {
  const [isActive, setIsActive] = useState(false);

  const classes = classnames('menu-icon', 'menu-button', {
    'is-active': isActive,
  });

  return (
    <header className="header">
      {/* TODO: Make a menu page */}

      <h1>Aquarius</h1>

      <div className="hamburger">
        <input type="checkbox" id="nav-toggle" hidden />
        <label htmlFor="nav-toggle">
          <span className="toggle-words">
            <a href="#" className={classes} onClick={() => setIsActive(true)}>
              <span className="burger-icon"></span>
            </a>
          </span>
        </label>
        <div className="menu">
          <ul>
            <li>
              <a href="#">Nav Item</a>
            </li>
            <li>
              <a href="#">Nav Item</a>
            </li>
            <li>
              <a href="#">Nav Item</a>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
