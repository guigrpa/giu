import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { merge }            from 'timm';
import {
  COLORS,
  MISC,
}                           from '../gral/constants';
import {
  bindAll,
}                           from '../gral/helpers';
import Backdrop             from '../components/backdrop';
import HintLabel            from '../components/hintLabel';
import HintArrow            from '../components/hintArrow';
require('./hintScreen.css');

const FONT_SIZE = 20;
const FONT_FAMILY = '"Gloria Hallelujah", cursive';

// ==========================================
// Component
// ==========================================
// **Warning**: an embedded `HintScreen` in a component
// with `translateZ(0)` or similar (which creates a stacking context and
// a containing block) will not be properly positioned and may even be cropped.
// In such a case, use `Hints` instead.
class HintScreen extends React.Component {
  static propTypes = {
    arrows:                 React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.func,
    ]),
    labels:                 React.PropTypes.oneOfType([
      React.PropTypes.array,
      React.PropTypes.func,
    ]),
    closeLabel:             React.PropTypes.string,
    onClose:                React.PropTypes.func,
    zIndex:                 React.PropTypes.number,
  };
  static defaultProps = {
    closeLabel:             'Got it!',
    zIndex:                 MISC.zHintBase,
  }

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    bindAll(this, [
    ]);
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    return (
      <div
        className="giu-hint-screen"
        onClick={this.props.onClose}
        style={style.outer(this.props.zIndex)}
      >
        { this.renderBackdrop() }
        <div style={style.contents}>
          { this.renderArrows() }
          { this.renderLabels() }
          { this.renderCloseButton() }
        </div>
      </div>
    );
  }

  renderBackdrop() { return <Backdrop style={style.backdrop} />; }

  renderArrows() {
    let { arrows } = this.props;
    if (typeof arrows === 'function') arrows = arrows();
    if (!arrows || !arrows.length) return null;
    return (
      <svg style={style.svg}>
        {arrows.map((arrow, idx) => <HintArrow key={idx} {...arrow} />)}
      </svg>
    );
  }

  renderLabels() {
    let { labels } = this.props;
    if (typeof labels === 'function') labels = labels();
    if (!labels) return null;
    return labels.map((label, idx) => (
      <HintLabel key={idx}
        fontSize={FONT_SIZE}
        {...label}
      />
    ));
  }

  renderCloseButton() {
    const { closeLabel } = this.props;
    return <div style={style.closeButton}>{closeLabel}</div>;
  }
}


// ==========================================
// Styles
// ==========================================
const style = {
  outer: (zIndex) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex,
  }),
  contents: {
    color: COLORS.lightText,
    fontSize: FONT_SIZE,
    fontFamily: FONT_FAMILY,
  },
  svg: {
    position: 'fixed',
    width: '100vw',
    height: '100vh',
    stroke: COLORS.lightText,
    strokeWidth: 2,
    fill: 'transparent',
    pointerEvents: 'none',
  },
  backdrop: {
    cursor: 'pointer',
    backgroundColor: 'black',
    opacity: 0.5,
  },
  closeButton: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    border: `1px solid ${COLORS.lightText}`,
    padding: '5px 25px',
    borderRadius: 8,
    cursor: 'pointer',
  },
};

// ==========================================
// Public API
// ==========================================
export default HintScreen;
