import React                from 'react';
import { omit }             from 'timm';

// ==========================================
// Component
// ==========================================
class FocusCapture extends React.Component {
  static propTypes = {
    registerRef:            React.PropTypes.func,
  };

  render() {
    const { registerRef } = this.props;
    const otherProps = omit(this.props, PROP_KEYS);
    return (
      <input ref={registerRef}
        style={style.outer}
        {...otherProps}
      />
    );
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  outer: {
    position: 'fixed',
    opacity: 0,
    width: 10,
    height: 10,
    padding: 0,
    cursor: 'default',
    pointerEvents: 'none',
    zIndex: -80,
    top: 8,
    left: 8,
  },
};

// ==========================================
// Miscellaneous
// ==========================================
const PROP_KEYS = Object.keys(FocusCapture.propTypes);

// ==========================================
// Public API
// ==========================================
export default FocusCapture;
