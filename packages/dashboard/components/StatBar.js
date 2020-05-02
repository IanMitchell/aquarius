import React from 'react';
// import useSWR from 'swr';

export default function StatBar() {
  // const { data } = useSWR();
  return (
    <section className="stats">
      <div className="box">
        <span className="label">Users</span>
        <h3>5000</h3>
      </div>
      <div className="box">
        <span className="label">Servers</span>
        <h3>30</h3>
      </div>
      <div className="box">
        <span className="label">Commands</span>
        <h3>153</h3>
      </div>
    </section>
  );
}
