// @flow

import React from 'react';
import { merge } from 'timm';
import { cancelEvent } from '../gral/helpers';
import { IS_IOS } from '../gral/constants';

// ==========================================
// Declarations
// ==========================================
type Props = {
  // All props are forwarded to the child `<div>`
  style?: Object,
};

// ==========================================
// Component
// ==========================================
class Backdrop extends React.PureComponent<Props> {
  render() {
    // Due to bug: https://github.com/zeit/styled-jsx/issues/329
    return (
      <div
        onWheel={cancelEvent}
        onTouchMove={cancelEvent}
        {...this.props}
        className="giu-backdrop"
        style={style.backdrop(this.props)}
      />
    );
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  backdrop: ({ style: baseStyle }) =>
    merge(
      {
        position: 'fixed',
        top: 0,
        left: 0,
        width: IS_IOS ? '110vw' : '100vw',
        height: IS_IOS ? '110vh' : '100vh',
        backgroundColor: 'white',
      },
      baseStyle
    ),
};

// ==========================================
// Public
// ==========================================
export default Backdrop;
