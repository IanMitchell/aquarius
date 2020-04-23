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
        <meta
          name="description"
          content="sulfur,business,company,agency,multipurpose,modern,bootstrap4"
        />

        <meta name="author" content="themefisher.com" />

        <title>Enov| Html5 Business template</title>
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
