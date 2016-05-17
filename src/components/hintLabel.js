import React                from 'react';
import { merge }            from 'timm';

// ==========================================
// Component
// ==========================================
class HintLabel extends React.Component {
  static propTypes = {
    x:                      React.PropTypes.number.isRequired,
    y:                      React.PropTypes.number.isRequired,
    align:                  React.PropTypes.oneOf(['left', 'right', 'center']),
    children:               React.PropTypes.any,
    fontSize:               React.PropTypes.number.isRequired,
  };
  static defaultProps = {
    align:                  'left',
  }

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
          { this.props.children }
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
  }),
  label: ({ align, fontSize, style: baseStyle }) => {
    const width = style.width || 200;
    let out = {
      position: 'absolute',
      [align === 'right' ? 'right' : 'left']: align === 'center' ? -width / 2 : 0,
      textAlign: align,
      marginLeft: 8,
      marginRight: 8,
      marginTop: align === 'center' ? fontSize * 0.3 : -fontSize * 0.7,
      fontSize: fontSize,
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
