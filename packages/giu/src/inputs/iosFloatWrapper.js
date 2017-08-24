// @flow

import * as React from 'react';
import { MISC } from '../gral/constants';
import type { FloatPosition, FloatAlign } from '../components/floats';

type Props = {
  children?: any,
  floatPosition?: FloatPosition,
  floatAlign?: FloatAlign,
  floatZ?: number,
};

const IosFloatWrapper = (props: Props) =>
  <div style={style.outer(props)}>
    {props.children}
  </div>;

const style = {
  outer: ({ floatPosition, floatAlign, floatZ }) => ({
    position: 'absolute',
    [floatPosition === 'above' ? 'bottom' : 'top']: '100%',
    [floatAlign === 'right' ? 'right' : 'left']: 0,
    zIndex: floatZ != null ? floatZ : MISC.zMainFloatDelta,
  }),
};

export default IosFloatWrapper;
