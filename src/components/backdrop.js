// @flow

import React                from 'react';
import { merge }            from 'timm';
import { cancelEvent }      from '../gral/helpers';
import { IS_IOS }           from '../gral/constants';

require('./backdrop.css');

// ==========================================
// Component
// ==========================================
// All props are forwarded to the child `<div>`
type Props = {
  style?: Object,
};

class Backdrop extends React.PureComponent {
  props: Props;

  render() {
    return (
      <div
        className="giu-backdrop"
        onWheel={cancelEvent}
        onTouchMove={cancelEvent}
        {...this.props}
        style={style.backdrop(this.props)}
      />
    );
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  backdrop: ({ style: baseStyle }) => merge({
    position: 'fixed',
    top: 0,
    left: 0,
    width: IS_IOS ? '110vw' : '100vw',
    height: IS_IOS ? '110vh' : '100vh',
    backgroundColor: 'white',
  }, baseStyle),
};

// ==========================================
// Public API
// ==========================================
export default Backdrop;
