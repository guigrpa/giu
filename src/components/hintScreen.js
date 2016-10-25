// @flow

import React                from 'react';
import {
  COLORS,
  MISC,
}                           from '../gral/constants';
import {
  bindAll,
}                           from '../gral/helpers';
import Backdrop             from '../components/backdrop';
import HintLabel            from '../components/hintLabel';
import type { HintLabelPropsT } from '../components/hintLabel';
import HintArrow            from '../components/hintArrow';
import type { HintArrowPropsT } from '../components/hintArrow';

require('./hintScreen.css');

const FONT_SIZE = 20;
const FONT_FAMILY = '"Gloria Hallelujah", sans-serif';

// ==========================================
// Component
// ==========================================
type ArrowT = HintArrowPropsT & { type: 'ARROW' };
type LabelT = HintLabelPropsT & { type: 'LABEL' };
type ElementT = ArrowT | LabelT;
type ElementsWrapperT = Array<ElementT> | () => Array<ElementT>;
export type HintScreenParsT = {
  elements: ElementsWrapperT,
  closeLabel?: string,
  zIndex?: number,
};
type PropsT = HintScreenParsT & {
  onClose: (ev: SyntheticMouseEvent) => void,
};

// **Warning**: an embedded `HintScreen` in a component
// with `translateZ(0)` or similar (which creates a stacking context and
// a containing block) will not be properly positioned and may even be cropped.
// In such a case, use `Hints` instead.
class HintScreen extends React.PureComponent {
  props: PropsT;
  static defaultProps: HintScreenParsT = {
    elements:               ([]: ElementsWrapperT),
    closeLabel:             'Got it!',
    zIndex:                 MISC.zHintBase,
  }

  constructor(props: PropsT) {
    super(props);
    bindAll(this, ['onResize']);
  }

  componentDidMount() { window.addEventListener('resize', this.onResize); }
  componentWillUnmount() { window.removeEventListener('resize', this.onResize); }

  // ==========================================
  // Render
  // ==========================================
  render() {
    let { elements } = this.props;
    if (typeof elements === 'function') elements = elements();
    return (
      <div
        className="giu-hint-screen"
        onClick={this.props.onClose}
        style={style.outer(this.props.zIndex)}
      >
        {this.renderBackdrop()}
        <div style={style.contents}>
          {this.renderArrows(elements)}
          {this.renderLabels(elements)}
          {this.renderCloseButton()}
        </div>
      </div>
    );
  }

  renderBackdrop() { return <Backdrop style={style.backdrop} />; }

  renderArrows(elements: Array<ElementT>) {
    const arrows: Array<ArrowT> =
      (elements.filter((o) => o.type === 'ARROW'): Array<any>);
    if (!arrows || !arrows.length) return null;
    return (
      <svg style={style.svg}>
        {arrows.map((arrow, idx) => <HintArrow key={idx} {...arrow} />)}
      </svg>
    );
  }

  renderLabels(elements: Array<ElementT>) {
    const labels: Array<LabelT> =
      (elements.filter((o) => o.type === 'LABEL'): Array<any>);
    if (!labels || !labels.length) return null;
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

  // ==========================================
  // Event handlers
  // ==========================================
  onResize() { this.forceUpdate(); }
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
    opacity: 0.6,
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
