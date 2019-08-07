// @flow

import React from 'react';
import classnames from 'classnames';
import { IS_IOS } from '../gral/constants';

// ==========================================
// Component
// ==========================================
type Props = {
  disabled?: boolean,
  registerRef?: (ref: ?Object) => void,
  // All other props are passed through to the input component
};

const FocusCapture = ({ registerRef, disabled, ...otherProps }: Props) => {
  const el = (
    <input
      ref={registerRef}
      className={classnames('giu-focus-capture', 'giu-hidden-field', {
        'giu-hidden-field-ios': IS_IOS,
      })}
      tabIndex={disabled ? -1 : undefined}
      {...otherProps}
    />
  );
  return IS_IOS ? (
    <span className="giu-focus-capture-wrapper-for-ios">{el}</span>
  ) : (
    el
  );
};

// ==========================================
// Public
// ==========================================
export default FocusCapture;
