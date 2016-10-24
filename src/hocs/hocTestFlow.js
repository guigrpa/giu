// @flow

import React                from 'react';
import { omit }             from 'timm';

/* eslint-disable react/no-multi-comp */
/* eslint-disable */

// declare class DerivedComponent<P, Def, St> extends React$Component<void, P, void> {
//   static defaultProps: void;
//   props: P;
//   state: void;
// }
// declare type DerivedComponentClass<P, Def, St> = Class<DerivedComponent<P, Def, St>>;

// <Def, St>(component: Class<React$Component<Def, P, St>>): ConnectedComponentClass<OP, P, Def, St>;

/*
type ExtraProps = { b?: number };

type StatelessComponent<P> = (props: P) => ?React$Element<any>;

function hoc<P>(
  ComposedComponent: StatelessComponent<P> | Class<React$Component<any, P, any>>
): Class<React$Component<void, $SuperType<P & ExtraProps>, void>> {
  class Derived extends React.Component {
    props: P & ExtraProps;
    render() {
      const otherProps = omit(this.props, ['b']);
      return <ComposedComponent {...this.props} />;
    }
  };
  return Derived;
}

class Foo extends React.Component {
  props: { a: string };
  render() {
    return <div>{this.props.a}</div>;
  }
}
const HoverableFoo = hoc(Foo);
const SLFoo = ({ a }: { a: string }) => <div>{a}</div>
const HoverableSLFoo = hoc(SLFoo);

export const g1 = () => <Foo a={'3'} />;
export const g2 = () => <HoverableFoo a={'3'} b={7} />;
export const g3 = () => <SLFoo a={'3'} />;
export const g4 = () => <HoverableSLFoo a={'3'} />;
*/

type HocProps = {
  hocProp?: string,
  c: string,
};

type HocDefaultProps = {
  c: string,
};

function hoc<DP, P, St>(
  ComposedComponent: Class<React$Component<DP, P, St>>
): Class<React$Component<(HocDefaultProps & $Diff<DP, HocDefaultProps>), (HocProps & $Diff<P, HocProps>), void>> {
  class Derived extends React.Component {
    props: (HocProps & $Diff<P, HocProps>);
    static defaultProps: HocDefaultProps & $Diff<DP, HocDefaultProps>;
    static defaultProps: any = { c: 'defaultC' };
    render() {
      const otherProps: P = (omit(this.props, ['hocProp']): any);
      return <ComposedComponent {...otherProps} />;
    }
  };
  return Derived;
}

class Foo extends React.Component {
  props: {
    a?: string,
    b: string,
    c: string,
    opt?: string,
  }
  defaultProps: { a: 'string' };
  static defaultProps = { a: 'defaultA' };
  render() {
    return <div>{this.props.a}</div>;
  }
}
const HoverableFoo = hoc(Foo);

export const ok1 = <Foo a="a" b="b" c="c" />;
export const ok1b = <HoverableFoo a="a" b="b" c="c" />;
export const ok2 = <Foo b="b" c="c" />;
export const ok2b = <HoverableFoo b="b" c="c" />;
export const ok3 = <Foo b="b" c="c" opt="hi" />;
export const ok3b = <HoverableFoo b="b" c="c" opt="hi" />;
// $FlowFixMe
export const nok1 = <Foo a="a" b="b" />;
// $FlowFixMe
export const nok2 = <Foo a="a" />;
// $FlowFixMe
export const nok2b = <HoverableFoo a="a" />;
// $FlowFixMe
export const nok3 = <Foo a="a" b={2} />;
// $FlowFixMe
export const nok3b = <HoverableFoo a="a" b={2} />;



type T1 = {
  c: string,
  a: string,
};
type T2 = {
  c: string,
};
type T3 = $Diff<T1, T2>;
const a: T3 = {
  a: 'hello',
};
