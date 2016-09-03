import React                from 'react';
import { merge }            from 'timm';
import { cancelEvent }      from '../gral/helpers';
import { IS_IOS }           from '../gral/constants';

// ==========================================
// Component
// ==========================================
class Backdrop extends React.PureComponent {
  static propTypes = {
    style:                  React.PropTypes.object,
  };

  // All props are forwarded to the child `<div>`
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
    opacity: 0.7,
  }, baseStyle),
};

// ==========================================
// Public API
// ==========================================
export default Backdrop;
