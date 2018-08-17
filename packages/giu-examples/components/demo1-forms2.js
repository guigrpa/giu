// @flow

/* eslint-disable react/no-string-refs */

import React from 'react';
import { NumberInput, isLte, Button, Select, notify, ThemeContext } from 'giu';
import type { Theme } from 'giu/lib/gral/themeContext';
import { ExampleLabel, exampleStyle, NORMAL_OPTIONS } from './demo1-common';

class FormExample extends React.Component<{ theme: Theme }, { a: any, b: any, c: any }> {
  refs: any;
  state: Object = { a: null, b: 4, c: null };

  render() {
    return (
      <div style={exampleStyle}>
        <ExampleLabel>Uncontrolled vs. controlled form example</ExampleLabel>
        {this.renderUncontrolled()}
        {this.renderControlled()}
      </div>
    );
  }

  renderUncontrolled() {
    const props = { required: true, validators: [isLte(10)] };
    return (
      <div>
        <b>Uncontrolled: </b>
        <NumberInput ref="a1" value={null} {...props} />
        <NumberInput ref="b1" value={3} {...props} />
        <Select ref="c1" items={NORMAL_OPTIONS} />
        <Button onClick={this.onSubmit('1')}>Read values</Button>
      </div>
    );
  }

  renderControlled() {
    const props = {
      required: true,
      validators: [isLte(10)],
    };
    return (
      <div>
        <b>Controlled: </b>
        <NumberInput
          ref="a2"
          value={this.state.a}
          onChange={(ev, val) => this.setState({ a: val })}
          {...props}
        />
        <NumberInput
          ref="b2"
          value={this.state.b}
          onChange={(ev, val) => this.setState({ b: val })}
          {...props}
        />
        <Select
          ref="c2"
          value={this.state.c}
          onChange={(ev, val) => this.setState({ c: val })}
          items={NORMAL_OPTIONS}
        />
        <Button onClick={this.onSubmit('2')}>Read values</Button>
      </div>
    );
  }

  onSubmit = (suffix: string) => async () => {
    try {
      const [a, b, c] = await Promise.all([
        this.refs[`a${suffix}`].validateAndGetValue(),
        this.refs[`b${suffix}`].validateAndGetValue(),
        this.refs[`c${suffix}`].validateAndGetValue(),
      ]);
      notify({
        msg: `Values: ${a}, ${b}, ${c}`,
        icon: this.props.theme.id === 'mdl' ? 'thumb_up' : 'thumbs-up',
      });
    } catch (err) {
      console.error(err);
      notify({
        msg: 'Validation failed',
        type: 'error',
        icon: this.props.theme.id === 'mdl' ? 'warning' : 'bullhorn',
      });
    }
  };

  readValues = async () => {};
}

// ==========================================
const ThemedFormExample = (props: Object) => (
  <ThemeContext.Consumer>
    {theme => <FormExample {...props} theme={theme} />}
  </ThemeContext.Consumer>
);

export default ThemedFormExample;
