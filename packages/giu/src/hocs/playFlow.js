// @flow

/* eslint-disable no-unused-vars, max-len */

import React from 'react';

export type AddedProps = {
  extra: string,
};

type DefaultProps<DP> = {
  /* :: ...$Exact<DP>, */
  /* :: ...$Exact<AddedProps>, */
};

type StatelessComponent<P> = (props: P) => ?React$Element<any>;
type Hoc<DP, P> = {
  (ComposedComponent: Class<React$Component<DP, P, *>>): Class<React$Component<DefaultProps<DP>, P, *>>;
  (a: StatelessComponent<P>): any, // FIXME
};

const hoc: Hoc<*, *> = (ComposedComponent) => {
  const Derived = () => {};
  return (Derived: any);
};

// =======================================
// Examples
// =======================================
type Props = { text: string, extra: string, cond?: string };

// ---------------------------------------
// Class-based
// ---------------------------------------
class A extends React.Component {
  props: Props;
  static defaultProps = {};

  render() {
    return <span>{this.props.text}{this.props.extra}</span>;
  }
}
const HA = hoc(A);

// Tests
// -----
// Correct use
const a0 = () => <HA text="foo" />;
const a0b = () => <HA text="foo" cond="bar" />;

// $FlowFixMe (missing prop)
const a1 = () => <HA />;
// $FlowFixMe (wrong type)
const a2 = () => <HA text={3} />;
// $FlowFixMe (wrong type on conditional)
const a3 = () => <HA text={3} cond={3} />;

// ---------------------------------------
// Functional examples (FIXME)
// ---------------------------------------
const B = (props: Props) => (
  <span>{props.text}{props.extra}</span>
);
const HB = hoc(B);

// Tests
// -----
// Correct use
const b0 = () => <HB text="foo" />;
const b0b = () => <HB text="foo" cond="bar" />;

// FIXME: should fail but doesn't (missing prop)
const b1 = () => <HB />;
// FIXME: should fail but doesn't (wrong type)
const b2 = () => <HB text={3} />;
// FIXME: should fail but doesn't (wrong type on conditional)
const b3 = () => <HB text={3} cond={3} />;

