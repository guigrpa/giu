// @flow

/* eslint-disable react/no-array-index-key */

import React from 'react';
import Backdrop from './backdrop';
import HintLabel from './hintLabel';
import HintArrow from './hintArrow';
import type { HintLabelPars } from './hintLabel'; // eslint-disable-line
import type { HintArrowPars } from './hintArrow'; // eslint-disable-line

// ==========================================
// Component
// ==========================================
const DEFAULT_CLOSE_LABEL = 'Got it!';

// -- START_DOCS
export type HintScreenPars = {|
  elements?: ElementsWrapper,
  closeLabel?: string, // label of the close button (default: 'Got it!')
|};
type ElementsWrapper = Array<Element> | (() => Array<Element>);
type Element = HintArrowPars | HintLabelPars;
// -- END_DOCS

type Props = {
  ...HintScreenPars,
  onClose: (ev: SyntheticMouseEvent<*>) => any,
};

// **Warning**: an embedded `HintScreen` in a component
// with `translateZ(0)` or similar (which creates a stacking context and
// a containing block) will not be properly positioned and may even be cropped.
// In such a case, use `Hints` instead.
class HintScreen extends React.PureComponent<Props> {
  componentDidMount() {
    window.addEventListener('resize', this.onResize);
  }
  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    let { elements } = this.props;
    if (typeof elements === 'function') elements = elements();
    if (!elements) elements = [];
    return (
      <div className="giu-hint-screen" onClick={this.props.onClose}>
        <Backdrop />
        <div className="giu-hint-screen-contents">
          {this.renderArrows(elements)}
          {this.renderLabels(elements)}
          <div className="giu-hint-screen-close">
            {this.props.closeLabel || DEFAULT_CLOSE_LABEL}
          </div>
        </div>
      </div>
    );
  }

  renderArrows(elements: Array<Element>) {
    const arrows: Array<HintArrowPars> = (elements.filter(
      o => o.type === 'ARROW'
    ): Array<any>);
    if (!arrows || !arrows.length) return null;
    return (
      <svg className="giu-hint-arrows">
        {arrows.map((arrow, idx) => (
          <HintArrow key={idx} {...arrow} />
        ))}
      </svg>
    );
  }

  renderLabels(elements: Array<Element>): ?Array<*> {
    const labels: Array<HintLabelPars> = (elements.filter(
      o => o.type === 'LABEL'
    ): Array<any>);
    if (!labels || !labels.length) return null;
    return labels.map((label, idx) => <HintLabel key={idx} {...label} />);
  }

  // ==========================================
  // Event handlers
  // ==========================================
  onResize = () => {
    this.forceUpdate();
  };
}

// ==========================================
// Public
// ==========================================
export default HintScreen;
