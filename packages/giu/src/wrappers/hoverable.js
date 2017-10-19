// @flow

import React from 'react';

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

Specific props received from the parent:

* **onHoverStart?** *HoverEventHandler (see below)*: relays the original event to
  the parent component.
* **onHoverStop?** *HoverEventHandler (see below)*: relays the original event to
  the parent component.
* **render?** *Function*: render function, receiving the `HoverableProps` below

Additional props passed to the base component:
-- */

/* -- START_DOCS -- */
export type HoverableProps = {|
  // `id` element that is hovered (see description above), or `null` if none
  hovering: Hovering,

  // `onMouseEnter` event handler you can attach to your target DOM elements
  onHoverStart: HoverEventHandler,

  // `onMouseLeave` event handler you can attach to your target DOM elements
  onHoverStop: HoverEventHandler,
|};
type Hovering = ?(string | number | boolean); // null when nothing is hovered
type HoverEventHandler = (ev: SyntheticEvent) => any;
/* -- END_DOCS -- */

export type PublicHoverableProps = {|
  onHoverStart?: HoverEventHandler,
  onHoverStop?: HoverEventHandler,
|};

type Props = {
  onHoverStart?: HoverEventHandler,
  onHoverStop?: HoverEventHandler,
  render: Function,
};
type State = {
  hovering: Hovering,
};

// ==========================================
// Hoverable
// ==========================================
class Hoverable extends React.Component {
  props: Props;
  state: State = { hovering: null };

  // ==========================================
  render() {
    return this.props.render({
      hovering: this.state.hovering,
      onHoverStart: this.onHoverStart,
      onHoverStop: this.onHoverStop,
    });
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

// ==========================================
// Public API
// ==========================================
export default Hoverable;
