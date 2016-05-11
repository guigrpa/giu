import React                from 'react';
import { omit }             from 'timm';
import { HIDDEN_FOCUS_CAPTURE } from '../gral/styles';

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
