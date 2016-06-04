import React                from 'react';
import { MISC }             from '../gral/constants';

const IosFloatWrapper = (props) =>
  <div style={style.outer(props)}>
    {props.children}
  </div>;

IosFloatWrapper.propTypes = {
  children:               React.PropTypes.any,
};

const style = {
  outer: ({
    floatPosition,
    floatAlign,
    floatZ,
  }) => ({
    position: 'absolute',
    [floatPosition === 'above' ? 'bottom' : 'top']: '100%',
    [floatAlign === 'right' ? 'right' : 'left']: 0,
    zIndex: floatZ != null ? floatZ : MISC.zMainFloatDelta,
  }),
};

export default IosFloatWrapper;
