import classnames from 'classnames';
import Link from 'next/link';
import React from 'react';
import Navigation from './Navigation';

export default function Header({ onClick, isActive }) {
  const classes = classnames('menu-icon', 'menu-button', {
    'is-active': isActive,
  });

  return (
    <header className="header">
      {/* TODO: Make a menu page */}

      <div className="hamburger">
        <a href="#" className={classes} onClick={onClick}>
          <span className="burger-icon"></span>
        </a>
      </div>

      <h1>
        <Link href="/">
          <a>Aquarius</a>
        </Link>
      </h1>

      <Navigation />
    </header>
  );
}
