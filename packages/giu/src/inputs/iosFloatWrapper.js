// @flow

import React from 'react';
import classnames from 'classnames';
import { stopPropagation } from '../gral/helpers';
import type { FloatPosition, FloatAlign } from '../components/floats';

type Props = {
  children?: any,
  floatPosition?: FloatPosition,
  floatAlign?: FloatAlign,
};

const IosFloatWrapper = ({ children, floatPosition, floatAlign }: Props) => (
  <div
    className={classnames(
      'giu-ios-float-wrapper',
      floatPosition === 'above'
        ? 'giu-ios-float-wrapper-above'
        : 'giu-ios-float-wrapper-below',
      floatAlign === 'right'
        ? 'giu-ios-float-wrapper-right'
        : 'giu-ios-float-wrapper-left'
    )}
    onScroll={stopPropagation}
  >
    {children}
  </div>
);

export default IosFloatWrapper;
