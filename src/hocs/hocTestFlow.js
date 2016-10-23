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
