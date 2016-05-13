import React                from 'react';
import { omit }             from 'timm';
import { HIDDEN_FOCUS_CAPTURE } from '../gral/styles';

// ==========================================
// Component
// ==========================================
class FocusCapture extends React.Component {
  static propTypes = {
    disabled:               React.PropTypes.bool,
    registerRef:            React.PropTypes.func,
  };

  render() {
    const { registerRef, disabled } = this.props;
    const otherProps = omit(this.props, PROP_KEYS);
    return (
      <input ref={registerRef}
        style={style.outer}
        tabIndex={disabled ? -1 : undefined}
        {...otherProps}
      />
    );
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  outer: HIDDEN_FOCUS_CAPTURE,
};

// ==========================================
// Miscellaneous
// ==========================================
const PROP_KEYS = Object.keys(FocusCapture.propTypes);

// ==========================================
// Public API
// ==========================================
export default FocusCapture;
