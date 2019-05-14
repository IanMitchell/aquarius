import App, { Container } from 'next/app';
import React from 'react';
import io from 'socket.io-client';
import SocketContext from '../contexts/Socket';

class MyApp extends App {
  state = {
    socket: null,
  };

  static async getInitialProps({ Component, ctx }) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  componentDidMount() {
    const socket = io();
    this.setState({ socket });
  }

  componentWillUnmount() {
    this.state.socket.close();
  }

  render() {
    const { Component, pageProps } = this.props;

    return (
      <Container>
        <SocketContext.Provider value={this.state.socket}>
          <Component {...pageProps} />
        </SocketContext.Provider>
      </Container>
    );
  }
}

export default MyApp;
