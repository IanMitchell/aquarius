/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
/* global fetch */

import 'isomorphic-unfetch';
import Head from 'next/head';
import React, { Fragment } from 'react';
import { SWRConfig } from 'swr';
import Layout from '../layouts/Layout';
import '../styles/main.scss';

export default function MyApp({ Component, pageProps }) {
  return (
    <Fragment>
      <Head>
        <title>Aquarius | Discord Bot</title>
      </Head>
      <SWRConfig
        value={{
          refreshInterval: 3000,
          fetcher: (...args) => fetch(...args).then((res) => res.json()),
        }}
      >
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </SWRConfig>
    </Fragment>
  );
}
