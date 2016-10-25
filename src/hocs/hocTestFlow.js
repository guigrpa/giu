// @flow

import React                from 'react';

/* eslint-disable react/no-multi-comp */
/* eslint-disable */

type NamesT = 'juan' | 'pedro';

type OwnPropsT = {
  c: string,
  d: string,
};
// type PropsT<P> = OwnPropsT & $Diff<P, OwnPropsT>;
// type PropsT<P> = P;

type OwnDefaultPropsT = {
  c: string,
};
// type HocDefaultPropsT<DP> = OwnDefaultPropsT & $Diff<DP, OwnDefaultPropsT>;
// type HocDefaultPropsT<DP> = DP;
// type HocDefaultPropsT<DP> = OwnDefaultPropsT & DefaultPropsT;
type PropsT<P, DP> = $Subtype<$Diff<$Diff<P & OwnPropsT, DP>, OwnDefaultPropsT>>;

function hoc<DP, P, St>(
  ComposedComponent: Class<React$Component<DP, P, St>>
): Class<React$Component<void, PropsT<P, DP>, void>> {
  class Derived extends React.Component {
    props: PropsT<P, DP>;
    // static defaultProps: HocDefaultPropsT<DP>;  // outward-facing interface
    static defaultProps: any = { c: 'defaultC' };  // `any`, since we are not respecting the inner interface here
    render() {
      const props: any = this;
      return <ComposedComponent {...props} c={props.c} />;
    }
  };
  return Derived;
}

// ------------------------------------
// Examples
// ------------------------------------
const dict = { one: 1, two: 2, three: 3 };

type FooDefaultPropsT = {
  a: string,
};

class Foo extends React.Component {
  props: {
    a: string,
    b: string,
    c: string,
    opt?: string,
  };
  static defaultProps: FooDefaultPropsT = { a: 'two' };
  render() {
    return <div>{dict[this.props.a]}</div>;
  }
}
const HoverableFoo = hoc(Foo);

// Passing everything
const a1 = <Foo a="one" b="b" c="c" d="d" />;
const a2 = <HoverableFoo a="one" b="b" c="c" d="d" />;

// Omitting `a` (there is a default prop for it in `Foo`)
const b1 = <Foo b="b" c="c" d="d" />;
const b2 = <HoverableFoo b="b" c="c" d="d" />;

// Passing an invalid value in `a` (should be a string)
// $FlowFixMe
const bb1 = <Foo a={1} b="b" c="c" d="d" />;
// $FlowFixMe
const bb2 = <HoverableFoo a={1} b="b" c="c" d="d" />;

// Omitting `b` (no default prop)
// $FlowFixMe
const c1 = <Foo a="one" c="c" d="d" />;
// $FlowFixMe
const c2 = <HoverableFoo a="one" c="c" d="d" />;

// Passing an invalid value in `b` (should be a string)
// $FlowFixMe
const d1 = <Foo a="one" b={2} c="c" d="d" />;
// $FlowFixMe
const d2 = <HoverableFoo a="one" b={2} c="c" d="d" />;

// Omitting `c` (there is a default prop for it in `HoverableFoo`)
// $FlowFixMe
const e1 = <Foo a="one" b="b" d="d" />;
const e2 = <HoverableFoo a="one" b="b" d="d" />;

// Passing an invalid value in `c` (should be a string)
// $FlowFixMe
const ee1 = <Foo a="one" b="b" c={2} d="d" />;
// $FlowFixMe
const ee2 = <HoverableFoo a="one" b="b" c={2} d="d" />;

// Omitting `d` (required by the HOC)
const f1 = <Foo a="one" b="b" c="c" />;
// $FlowFixMe
const f2 = <HoverableFoo a="one" b="b" c="c" />;

// Passing an invalid value in `d` (should be a string)
const g1 = <Foo a="one" b="b" c="c" d={2} />;
// $FlowFixMe
const g2 = <HoverableFoo a="one" b="b" c="c" d={2} />;

// ------------------------------------
type BarDefaultPropsT = {
  name: NamesT,
};

class Bar extends React.Component {
  props: {
    name: NamesT,
  };
  static defaultProps: BarDefaultPropsT = {
    name: 'juan',
  }
  render() {
    return <div>{this.props.name}</div>;
  }
}
const HoverableBar = hoc(Bar);

// Passing everything
const z1 = <Bar name="juan" d="d" />
const z2 = <HoverableBar name="juan" d="d" />

// Passing a wrong prop
// $FlowFixMe
const y1 = <Bar name="manolo" d="d" />
// $FlowFixMe
const y2 = <HoverableBar name="manolo" d="d" />
