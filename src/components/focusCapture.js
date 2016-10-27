// @flow

import React                from 'react';
import { omit }             from 'timm';
import { IS_IOS }           from '../gral/constants';
import {
  HIDDEN_FOCUS_CAPTURE,
  HIDDEN_FOCUS_CAPTURE_IOS,
}                           from '../gral/styles';

// ==========================================
// Component
// ==========================================
type PropsT = {
  disabled?: boolean,
  registerRef?: (ref: any) => void,
};
const FILTERED_PROPS = ['disabled', 'registerRef'];

class FocusCapture extends React.Component {
  props: PropsT;

  render() {
    const { registerRef, disabled } = this.props;
    const otherProps = omit(this.props, FILTERED_PROPS);
    const el = (
      <input ref={registerRef}
        style={style.input}
        tabIndex={disabled ? -1 : undefined}
        {...otherProps}
      />
    );
    return IS_IOS ?
      <span style={style.iosWrapper}>{el}</span> :
      el;
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  input: IS_IOS ? HIDDEN_FOCUS_CAPTURE_IOS : HIDDEN_FOCUS_CAPTURE,
  iosWrapper: { position: 'relative' },
};

// ==========================================
// Public API
// ==========================================
export default FocusCapture;
