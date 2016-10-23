// @flow

import React                from 'react';
import { omit }             from 'timm';
import { bindAll }          from '../gral/helpers';

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
type PropsT = {
  onHoverStart?: (ev: SyntheticMouseEvent) => void,
  onHoverStop?: (ev: SyntheticMouseEvent) => void,
};

export type HoverablePropsT = {
  hovering: ?(string|number|boolean),
  onHoverStart: (ev: SyntheticMouseEvent) => void,
  onHoverStop: (ev: SyntheticMouseEvent) => void,
};

function hoverable(ComposedComponent: ReactClass<*>): ReactClass<*> {
  const composedComponentName = ComposedComponent.displayName ||
    ComposedComponent.name || 'Component';
  const hocDisplayName = `Hoverable(${composedComponentName})`;

  return class extends React.Component {
    props: PropsT;
    state: {
      hovering: ?(string|number|boolean),
    };

    static displayName = hocDisplayName;
    static propTypes = {
      onHoverStart:           React.PropTypes.func,
      onHoverStop:            React.PropTypes.func,
    };

    constructor(props: PropsT) {
      super(props);
      this.state = { hovering: null };
      bindAll(this, [
        'onHoverStart',
        'onHoverStop',
      ]);
    }

    render() {
      const otherProps = omit(this.props, [
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

    onHoverStart(ev: SyntheticMouseEvent) {
      let id;
      if (ev.currentTarget instanceof Element) {
        id = ev.currentTarget.id;
      }
      if (id == null) id = true;
      this.setState({ hovering: id });
      if (this.props.onHoverStart) this.props.onHoverStart(ev);
    }

    onHoverStop(ev: SyntheticMouseEvent) {
      this.setState({ hovering: null });
      if (this.props.onHoverStop) this.props.onHoverStop(ev);
    }
  };
}

// ==========================================
// Public API
// ==========================================
export default hoverable;
