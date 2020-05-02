import React, { Fragment } from 'react';
import useSWR from 'swr';

export default function Index() {
  const { data } = useSWR('https://api.aquarius.sh/link');

  return (
    <Fragment>
      <section className="box stats">
        <h3 className="box-title">Aquarius Stats</h3>
        <div className="box-content">
          <span>Users/</span>
          <p>5000</p>
          <span>Guilds/</span>
          <p>29</p>
          <span>Commands/</span>
          <p>55</p>
        </div>
      </section>

      <section className="box add">
        <h3 className="box-title">Add Aquarius</h3>
        <div className="box-content box-content_split">
          <h3>Want to add Aquarius?</h3>
          <p>
            Aquarius is a <a href="https://discordapp.com">Discord</a> bot that
            you can configure to suit your server&apos;s needs. Whether that
            means enabling fun commands like dadjoke, moderation commands that
            automatically delete zalgo text, or information access commands like
            magic card lookups, Aquarius will help!
          </p>
          <a href={data?.url || '#'} className="button">
            Add Aquarius
          </a>
        </div>
      </section>
    </Fragment>
  );
}
