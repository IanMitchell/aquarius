import React from 'react';
import SocketContext from '../contexts/Socket';
import Metrics from '../components/Metrics';

export default class extends React.Component {
  static contextType = SocketContext;

  constructor(props) {
    super(props);

    this.state = {
      members: 0,
      subscribed: false,
    };
  }

  componentDidMount() {
    if (this.context) {
      this.subscribe();
    }
  }

  componentDidUpdate() {
    if (this.context) {
      this.subscribe();
    }
  }

  subscribe() {
    if (!this.state.subscribed) {
      this.context.on('update', event => {
        this.setState({ members: event.members });
      });

      this.setState({ subscribed: true });
    }
  }

  render() {
    return (
      <>
        <h1>Dashboard Goes Here</h1>
        <p>{this.state.members} Members</p>
        <Metrics />
      </>
    );
  }
}
