// @flow

import React from 'react';
import { merge } from 'timm';

// ==========================================
// Component
// ==========================================
// -- START_DOCS
export type HintLabelPars = {|
  type: 'LABEL',
  x: number,
  y: number,
  align?: AlignType, // (default: 'left')
  children?: any, // React elements that comprise the label
  fontSize?: number, // will be initialised by the HintScreen
  style?: Object,
|};
type AlignType = 'left' | 'right' | 'center';
// -- END_DOCS

type Props = {
  ...HintLabelPars,
  fontSize: number,
};

class HintLabel extends React.Component<Props> {
  render() {
    return (
      <div className="giu-hint-label" style={style.outer(this.props)}>
        <div style={style.label(this.props)}>{this.props.children}</div>
      </div>
    );
  }
}

// ==========================================
const style = {
  outer: ({ x, y }) => ({
    position: 'fixed',
    top: y,
    left: x,
    width: 0,
    pointerEvents: 'none',
  }),
  label: ({ align = 'left', fontSize, style: baseStyle }) => {
    const width = baseStyle ? baseStyle.width : 200;
    let out = {
      position: 'absolute',
      [align === 'right' ? 'right' : 'left']:
        align === 'center' ? -width / 2 : 0,
      textAlign: align,
      marginLeft: 8,
      marginRight: 8,
      marginTop: align === 'center' ? fontSize * 0.3 : -fontSize * 0.7,
      fontSize,
      // lineHeight: `${fontSize + 5}px`,
      lineHeight: 1.45,
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
