// @flow

import React from 'react';
import { merge } from 'timm';
import { cancelEvent } from '../gral/helpers';
import { IS_IOS } from '../gral/constants';

// ==========================================
// Component
// ==========================================
type Props = {
  style?: Object,
};

class Backdrop extends React.PureComponent {
  // All props are forwarded to the child `<div>`
  props: Props;

  render() {
    // Due to bug: https://github.com/zeit/styled-jsx/issues/329
    return (
      <div
        onWheel={cancelEvent}
        onTouchMove={cancelEvent}
        {...this.props}
        className="giu-backdrop"
        style={style.backdrop(this.props)}
      >
        {STYLES}
      </div>
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

const STYLES = (
  <style jsx global>{`
    @keyframes appear {
      from {
        opacity: 0;
      }
      to {
        opacity: 0.6;
      }
    }

    .giu-backdrop {
      animation: appear 300ms;
      -webkit-animation: appear 300ms;
      opacity: 0.6;
    }
  `}</style>
);

// ==========================================
// Public API
// ==========================================
export default Backdrop;
