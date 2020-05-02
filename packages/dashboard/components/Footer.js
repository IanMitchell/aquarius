/* eslint-disable react/jsx-one-expression-per-line */
import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <h3>The Aquarius Project</h3>
        <div className="footer-meta">
          <p>
            <a href="https://twitter.com/@IanMitchel1">@IanMitchel1</a>
          </p>
          <p>Copyright &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}
