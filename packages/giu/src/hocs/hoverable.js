// @flow

import React from 'react';
import { omit } from 'timm';

/* eslint-disable max-len */

// ==========================================
// Types and docs
// ==========================================
/* --
Keeps track of `hovering` state and passes it as prop to your base
component. Provides `onHoverStart`/`onHoverStop` event handlers
(for `mouseenter` and `mouseleave`, respectively)
you can attach to any of your base component's DOM elements
(works for multiple elements).
If you attach these handlers to an element with an `id` attribute,
the provided `hovering`
prop will contain the ID of the hovered element (or `null`); otherwise,
just `true` (or `null`).

Specific props received from the parent (all other props are
passed through):

* **onHoverStart?** *HoverEventHandler (see below)*: relays the original event to
  the parent component.
* **onHoverStop?** *HoverEventHandler (see below)*: relays the original event to
  the parent component.

Limitations regarding Flow:

* This HOC accepts both functional and class-based React components.
* For the HOC result to be properly typed, however, the composed component
  must be a class-based React component and have `defaultProps` defined
  (even if empty, e.g. `static defaultProps = {};`).
* If you're passing a functional component, just add a FlowFixMe directive
  in a comment before the call to `hoverable()` so that Flow won't complain.

Additional props passed to the base component:
-- */

/* -- START_DOCS -- */
export type HoverableProps = {
  // `id` element that is hovered (see description above), or `null` if none
  hovering: Hovering,

  // `onMouseEnter` event handler you can attach to your target DOM elements
  onHoverStart: HoverEventHandler,

  // `onMouseLeave` event handler you can attach to your target DOM elements
  onHoverStop: HoverEventHandler,
};
type Hovering = ?(string | number | boolean); // null when nothing is hovered
type HoverEventHandler = (ev: SyntheticEvent) => void;
/* -- END_DOCS -- */

/* eslint-disable no-unused-vars */
type PublicDefaultProps<DP> = {
  /* :: ...$Exact<DP>, */
  /* :: ...$Exact<HoverableProps>, */
};
/* eslint-enable no-unused-vars */

// ==========================================
// HOC
// ==========================================
function hoverable<DP: any, P>(
  ComposedComponent: Class<React$Component<DP, P, *>>,
): Class<React$Component<PublicDefaultProps<DP>, P, *>> {
  const composedComponentName =
    ComposedComponent.displayName || ComposedComponent.name || 'Component';
  const hocDisplayName = `Hoverable(${composedComponentName})`;

  class Derived extends React.Component {
    static displayName = hocDisplayName;
    props: {
      onHoverStart?: HoverEventHandler,
      onHoverStop?: HoverEventHandler,
    };
    state: { hovering: Hovering };

    constructor() {
      super();
      this.state = { hovering: null };
    }

    render() {
      const otherProps = omit(this.props, ['onHoverStart', 'onHoverStop']);
      return (
        <ComposedComponent
          {...otherProps}
          hovering={this.state.hovering}
          onHoverStart={this.onHoverStart}
          onHoverStop={this.onHoverStop}
        />
      );
    }

    onHoverStart = (ev: SyntheticEvent) => {
      let id;
      if (ev.currentTarget instanceof Element) {
        id = ev.currentTarget.id;
      }
      if (!id) id = true;
      this.setState({ hovering: id });
      if (this.props.onHoverStart) this.props.onHoverStart(ev);
    };

    onHoverStop = (ev: SyntheticEvent) => {
      this.setState({ hovering: null });
      if (this.props.onHoverStop) this.props.onHoverStop(ev);
    };
  }

  return (Derived: any);
}

// ==========================================
// Public API
// ==========================================
export default hoverable;
