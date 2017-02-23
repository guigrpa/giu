import React from 'react';
import { NumberInput } from '../src';
import {
  ExampleLabel, exampleStyle,
} from './demo1-common';

class FormExample extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      a: 3,
      b: 4,
      c: 5
    };
  }

  render() {
    return (
      <div style={exampleStyle}>
        <ExampleLabel>Form example</ExampleLabel>
        <NumberInput ref="a"
          value={this.state.a}
          onChange={this.onChange}
          required
        />
        <NumberInput ref="b"
          value={this.state.b}
          onChange={this.onChange}
          required
        />
        <NumberInput ref="c"
          value={this.state.c}
          onChange={(ev, c) => this.setState({ c })}
          required
        />
      </div>
    );
  }

  onChange = async () => {
    console.log('Changing...');
    const a = this.refs.a.getValue();
    const b = this.refs.b.getValue();
    console.log({ a, b })
  }
}

export default FormExample;
