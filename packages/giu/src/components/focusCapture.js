// @flow

import * as React from 'react';
import { IS_IOS } from '../gral/constants';
import { HIDDEN_FOCUS_CAPTURE, HIDDEN_FOCUS_CAPTURE_IOS } from '../gral/styles';

// ==========================================
// Component
// ==========================================
type Props = {
  disabled?: boolean,
  registerRef?: (ref: ?Object) => void,
};

const FocusCapture = ({ registerRef, disabled, ...otherProps }: Props) => {
  const el = (
    <input
      ref={registerRef}
      style={style.input}
      tabIndex={disabled ? -1 : undefined}
      {...otherProps}
    />
  );
  return IS_IOS
    ? <span style={style.iosWrapper}>
        {el}
      </span>
    : el;
};

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
