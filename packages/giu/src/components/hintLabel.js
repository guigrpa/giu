// @flow

import React from 'react';
import classnames from 'classnames';

// ==========================================
// Component
// ==========================================
// -- START_DOCS
export type HintLabelPars = {|
  type: 'LABEL',
  className?: string,
  id?: string,
  x: number,
  y: number,
  align?: AlignType, // (default: 'left')
  children?: any, // React elements that comprise the label
|};
type AlignType = 'left' | 'right' | 'center';
// -- END_DOCS

type Props = {
  ...HintLabelPars,
};

class HintLabel extends React.Component<Props> {
  render() {
    const { id, x, y, align = 'left' } = this.props;
    return (
      <div
        className={classnames('giu-hint-label', this.props.className)}
        id={id}
        style={{ top: y, left: x }}
      >
        <div className={`giu-hint-label-inner giu-hint-label-inner-${align}`}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

// ==========================================
// Public
// ==========================================
export default HintLabel;
