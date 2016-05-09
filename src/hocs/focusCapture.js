import React                from 'react';
import { omit }             from 'timm';
import { bindAll }          from '../gral/helpers';
import FocusCapture         from '../components/focusCapture';

const PROP_TYPES = {
  registerFocusableRef:   React.PropTypes.func,
  onFocus:                React.PropTypes.func.isRequired,
  onBlur:                 React.PropTypes.func.isRequired,
  styleOuter:             React.PropTypes.object,
  // all others are passed through unchanged
};
const PROP_KEYS = Object.keys(PROP_TYPES);

function focusCapture(ComposedComponent, {
  trappedKeys = [],
  className = 'giu-focus-capture-wrapper',
} = {}) {
  return class extends React.Component {
    static displayName = `Focusable(${ComposedComponent.name})`;
    static propTypes = PROP_TYPES;

    constructor(props) {
      super(props);
      this.keyDown = null;
      bindAll(this, [
        'registerInputRef',
        'onKeyDown',
        'onClick',
      ]);
    }

    // ==========================================
    // Render
    // ==========================================
    render() {
      const {
        registerFocusableRef,
        onFocus, onBlur,
        styleOuter,
      } = this.props;
      const otherProps = omit(this.props, PROP_KEYS);
      return (
        <div
          className={className}
          onClick={this.onClick}
          style={styleOuter}
        >
          <FocusCapture
            registerRef={this.registerInputRef}
            onFocus={onFocus} onBlur={onBlur}
            onKeyDown={this.onKeyDown}
          />
          <ComposedComponent
            {...otherProps}
            keyDown={this.keyDown}
          />
        </div>
      )
    }

    // ==========================================
    // Event handlers
    // ==========================================
    registerInputRef(c) {
      this.refInput = c;
      this.props.registerFocusableRef(c);
    }

    onKeyDown(ev) {
      const { which, keyCode, metaKey, shiftKey, altKey, ctrlKey } = ev;
      if (trappedKeys.indexOf(which) < 0) return;
      this.keyDown = { which, keyCode, metaKey, shiftKey, altKey, ctrlKey };
      this.forceUpdate();
    }

    onClick(ev) { this.refInput && this.refInput.focus(); }
  }
}

// ==========================================
// Public API
// ==========================================
export default focusCapture;
