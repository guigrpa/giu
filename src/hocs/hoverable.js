import React                from 'react';
import { omit }             from 'timm';
import { bindAll }          from '../gral/helpers';

// ==========================================
// HOC
// ==========================================
// -- Keeps track of `hovering` state and passes it as prop to your base
// -- component. Provides `onHoverStart`/`onHoverStop` event handlers
// -- you can attach to any of your base component's DOM elements
// -- (works for multiple elements).
// -- If you attach these handlers to an element with an `id` attribute,
// -- the provided `hovering`
// -- prop will contain the ID of the hovered element (or `null`), otherwise
// -- just `true` (or `null`).
// --
// -- Specific props received from the parent (all other props are
// -- passed down):
// --
// -- * *Function* **[onHoverStart]**: relays the original event to
// --   the parent component.
// -- * *Function* **[onHoverStop]**: relays the original event to
// --   the parent component.
// --
// -- Additional props passed to the base component:
// --
// -- * *String|Number|Boolean?* **hovering**: identifies the
// --   element that is hovered (see description above), or `null` if none
// -- * *Function* **onHoverStart**: `onMouseEnter` event handler you can attach to
// --   your target DOM elements
// -- * *Function* **onHoverStop**: `onMouseLeave` event handler you can attach to
// --   your target DOM elements
function hoverable(ComposedComponent) {
  return class extends React.Component {
    static propTypes = {
      onHoverStart:           React.PropTypes.func,
      onHoverStop:            React.PropTypes.func,
    };

    constructor(props) {
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

    onHoverStart(ev) {
      const id = ev.currentTarget.id || true;
      this.setState({ hovering: id });
      if (this.props.onHoverStart) this.props.onHoverStart(ev);
    }

    onHoverStop(ev) {
      this.setState({ hovering: null });
      if (this.props.onHoverStop) this.props.onHoverStop(ev);
    }
  };
}

// ==========================================
// Public API
// ==========================================
export default hoverable;
