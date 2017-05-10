// @flow

/* eslint-disable no-unused-vars, max-len */

import React from 'react';
import type { StatelessComponent } from '../gral/types';

// =======================================
// Example HOC
// (no-op, it just passes through
// all props and adds a few of its own)
// =======================================
type HocAddedProps = {
  extra: string,
};

type PublicDefaultProps<DP> = {
  /* :: ...$Exact<DP>, */
  /* :: ...$Exact<HocAddedProps>, */
};

type PublicProps<P> = P;

type Hoc<DP, P> = {
  (
    ComposedComponent: Class<React$Component<DP, P, *>>
  ): Class<React$Component<PublicDefaultProps<DP>, PublicProps<P>, *>>,
  (a: StatelessComponent<P>): any, // FIXME
};

const hoc: Hoc<*, *> = ComposedComponent => (ComposedComponent: any);

// =======================================
// Examples
// =======================================
/* eslint-disable no-unused-vars */
type OuterProps = {
  /* :: ...$Exact<HocAddedProps>, */
  text: string,
  cond?: string,
  cond2?: string,
};
/* eslint-enable no-unused-vars */

type Props = {
  /* :: ...$Exact<OuterProps>, */
  cond2: string,
};

// ---------------------------------------
// Class-based
// ---------------------------------------
class A extends React.Component {
  props: Props;
  static defaultProps = {
    cond2: 'hello',
  };

  render() {
    const txt =
      `${this.props.text} ${this.props.extra} ` +
      `${this.props.cond || 'xxx'} ${this.props.cond2}`;
    return <span>{txt}</span>;
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
const a3 = () => <HA text="foo" cond={3} />;
// $FlowFixMe (wrong type on conditional 2)
const a4 = () => <HA text="foo" cond2={3} />;

// ---------------------------------------
// Functional examples (FIXME)
// ---------------------------------------
const B = (props: Props) => <span>{props.text}{props.extra}</span>;
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
