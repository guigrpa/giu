// @flow

import React from 'react';

// ==========================================
// Component
// ==========================================
// -- START_DOCS
export type HintLabelPars = {|
  type: 'LABEL',
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
    const { id, x, y, align } = this.props;
    return (
      <div id={id} className="giu-hint-label" style={{ top: y, left: x }}>
        <div
          className={`giu-hint-label-inner giu-hint-label-inner-${align ||
            'left'}`}
        >
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
