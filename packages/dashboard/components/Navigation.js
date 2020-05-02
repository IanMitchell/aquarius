/* eslint-disable spaced-comment */
/* eslint-disable jsx-a11y/anchor-is-valid */
import Link from 'next/link';
import React from 'react';

export default function Navigation() {
  return (
    <nav>
      <ul>
        <li>
          <Link href="/">
            <a>Home</a>
          </Link>
        </li>
        <li>
          <Link href="/docs">
            <a>Docs</a>
          </Link>
        </li>
        {/* <li>
          <Link href="/development">
            <a>Development</a>
          </Link>
        </li>
        <li>
          <Link href="/dashboard">
            <a>Dashboard</a>
          </Link>
        </li>
        <li>
          <Link href="/sponsors">
            <a>Sponsors</a>
          </Link>
        </li>*/}
      </ul>
    </nav>
  );
}
