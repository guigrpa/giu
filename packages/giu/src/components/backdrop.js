// @flow

import React from 'react';
import classnames from 'classnames';
import { cancelEvent } from '../gral/helpers';
import { IS_IOS } from '../gral/constants';

// ==========================================
// Declarations
// ==========================================
type Props = {
  className?: string,
  id?: string,
};

// ==========================================
// Component
// ==========================================
const Backdrop = ({ id, className }: Props) => (
  <div
    className={classnames(
      'giu-backdrop',
      { 'giu-backdrop-ios': IS_IOS },
      className
    )}
    id={id}
    onWheel={cancelEvent}
    onTouchMove={cancelEvent}
  />
);

// ==========================================
// Public
// ==========================================
export default Backdrop;
