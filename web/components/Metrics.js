import React from 'react';
import SocketContext from '../contexts/Socket';

export default class extends React.Component {
  static contextType = SocketContext;

  constructor(props) {
    super(props);

    this.state = {
      metrics: null,
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
      this.context.on('updateMetrics', event => {
        this.setState({ metrics: event.metrics });
      });

      this.setState({ subscribed: true });
    }
  }

  render() {
    return (
      <>
        {this.state.metrics && (
          <React.Fragment>
            <p>CPU: {this.state.metrics.cpu}</p>
            <p>Memory: {this.state.metrics.memory}</p>
            <p>Uptime: {this.state.metrics.uptime}</p>
          </React.Fragment>
        )}
      </>
    );
  }
}
