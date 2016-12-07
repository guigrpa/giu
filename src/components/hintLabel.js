// @flow

import React                from 'react';
import { merge }            from 'timm';

// ==========================================
// Component
// ==========================================
type AlignType = 'left' | 'right' | 'center';
type Props = {
  x: number,
  y: number,
  align?: AlignType,
  children?: any,
  fontSize: number,
  style?: Object,
};
export type HintLabelProps = {
  x: number,
  y: number,
  align?: AlignType,
  children?: any,
  fontSize?: number,  // will be initialised by the HintScreen
  style?: Object,
};

class HintLabel extends React.Component {
  props: Props;

  // ==========================================
  // Render
  // ==========================================
  render() {
    return (
      <div
        className="giu-hint-label"
        style={style.outer(this.props)}
      >
        <div style={style.label(this.props)}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

// ==========================================
// Styles
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
    const width = style.width || 200;
    let out = {
      position: 'absolute',
      [align === 'right' ? 'right' : 'left']: align === 'center' ? -width / 2 : 0,
      textAlign: align,
      marginLeft: 8,
      marginRight: 8,
      marginTop: align === 'center' ? fontSize * 0.3 : -fontSize * 0.7,
      fontSize,
      lineHeight: `${fontSize + 5}px`,
      width,
    };
    out = merge(out, baseStyle);
    return out;
  },
};

// ==========================================
// Public API
// ==========================================
export default HintLabel;
