// @flow

import React from 'react';
import { merge } from 'timm';

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
  style?: Object,
|};
type AlignType = 'left' | 'right' | 'center';
// -- END_DOCS

type Props = {
  ...HintLabelPars,
};

class HintLabel extends React.Component<Props> {
  render() {
    const { x, y } = this.props;
    return (
      <div className="giu-hint-label" style={{ top: y, left: x }}>
        <div className="giu-hint-label-inner" style={style.label(this.props)}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

// ==========================================
const style = {
  label: ({ align = 'left', style: baseStyle }) => {
    const width = baseStyle ? baseStyle.width : 200;
    let out = {
      [align === 'right' ? 'right' : 'left']:
        align === 'center' ? -width / 2 : 0,
      textAlign: align,
      width,
    };
    out = merge(out, baseStyle);
    return out;
  },
};

// ==========================================
// Public
// ==========================================
export default HintLabel;
