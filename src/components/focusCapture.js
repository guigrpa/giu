import React                from 'react';
import { merge, omit }      from 'timm';
import { IS_IDEVICE }       from '../gral/constants';
import {
  HIDDEN_FOCUS_CAPTURE,
}                           from '../gral/styles';

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
    const el = (
      <input ref={registerRef}
        style={style.input}
        tabIndex={disabled ? -1 : undefined}
        {...otherProps}
      />
    );
    if (IS_IDEVICE) {
      return <span style={style.iDeviceWrapper}>{el}</span>
    } else {
      return el;
    }
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  input: IS_IDEVICE
    ? merge(HIDDEN_FOCUS_CAPTURE, {
        position: 'absolute',
        top: 0,
        left: 0,
      })
    : HIDDEN_FOCUS_CAPTURE,
  iDeviceWrapper: {
    position: 'relative',
    opacity: 0,
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
