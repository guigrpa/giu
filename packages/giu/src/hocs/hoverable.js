// @flow

import React                from 'react';
import { omit }             from 'timm';

// ==========================================
// HOC
// ==========================================
// -- Keeps track of `hovering` state and passes it as prop to your base
// -- component. Provides `onHoverStart`/`onHoverStop` event handlers
// -- (for `mouseenter` and `mouseleave`, respectively)
// -- you can attach to any of your base component's DOM elements
// -- (works for multiple elements).
// -- If you attach these handlers to an element with an `id` attribute,
// -- the provided `hovering`
// -- prop will contain the ID of the hovered element (or `null`); otherwise,
// -- just `true` (or `null`).
// --
// -- Specific props received from the parent (all other props are
// -- passed through):
// --
// -- * **onHoverStart?** *(ev: SyntheticMouseEvent) => void*: relays the original event to
// --   the parent component.
// -- * **onHoverStop?** *(ev: SyntheticMouseEvent) => void*: relays the original event to
// --   the parent component.
// --
// -- Additional props passed to the base component:
// --
// -- * **hovering** *?(string|number|boolean)*: identifies the
// --   element that is hovered (see description above), or `null` if none
// -- * **onHoverStart** *(ev: SyntheticMouseEvent) => void*: `onMouseEnter` event handler
// --   you can attach to your target DOM elements
// -- * **onHoverStop** *(ev: SyntheticMouseEvent) => void*: `onMouseLeave` event handler
// --   you can attach to your target DOM elements
type HoverEventHandler = (ev: SyntheticMouseEvent) => void;
type Hovering = ?(string|number|boolean);

type OwnProps = {
  // hovering: Hovering,
  onHoverStart?: HoverEventHandler,
  onHoverStop?: HoverEventHandler,
};
// type OwnDefaultProps = OwnProps;  // all HOC props are optional

// type Props<P, DP> = $Subtype<$Diff<$Diff<P & OwnProps, DP>, OwnDefaultProps>>;
type Props<P, DP> = $Subtype<$Diff<P & OwnProps, DP>>;

type State = {
  hovering: Hovering,
};

// Passed down by this HOC
export type HoverableProps = {
  hovering: Hovering,
  onHoverStart: HoverEventHandler,
  onHoverStop: HoverEventHandler,
};

function hoverable<DP, P, St>(
  ComposedComponent: Class<React$Component<DP, P, St>>
): Class<React$Component<void, Props<P, DP>, State>> {
  const composedComponentName = ComposedComponent.displayName ||
    ComposedComponent.name || 'Component';
  const hocDisplayName = `Hoverable(${composedComponentName})`;

  class Derived extends React.Component {
    props: Props<P, DP>
    state: State;

    static displayName = hocDisplayName;

    constructor(props: Props<P, DP>) {
      super(props);
      this.state = { hovering: null };
    }

    render() {
      const otherProps: any = omit(this.props, [
        'onHoverStart', 'onHoverStop',
      ]);
      return (
        <ComposedComponent
          {...otherProps}
          hovering={this.state.hovering}
          onHoverStart={this.onHoverStart}
          onHoverStop={this.onHoverStop}
        />
      );
    }

    onHoverStart = (ev: SyntheticMouseEvent) => {
      let id;
      if (ev.currentTarget instanceof Element) {
        id = ev.currentTarget.id;
      }
      if (!id) id = true;
      this.setState({ hovering: id });
      if (this.props.onHoverStart) this.props.onHoverStart(ev);
    }

    onHoverStop = (ev: SyntheticMouseEvent) => {
      this.setState({ hovering: null });
      if (this.props.onHoverStop) this.props.onHoverStop(ev);
    }
  }

  return Derived;
}

// ==========================================
// Public API
// ==========================================
export default hoverable;
