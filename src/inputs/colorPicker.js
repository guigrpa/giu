import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import tinycolor            from 'tinycolor2';
import { merge }            from 'timm';
import {
  COLORS,
  UNICODE,
  KEYS,
}                           from '../gral/constants';
import {
  bindAll,
  cancelEvent,
}                           from '../gral/helpers';
import {
  isDark,
  flexContainer, flexItem,
  inputReset, INPUT_DISABLED,
  GLOW,
}                           from '../gral/styles';
import hoverable            from '../hocs/hoverable';
require('./colorPicker.css');

const SIZE = 190;
const SLIDER_WIDTH = 6;
const SWATCH_RADIUS = 6;

const hueBg = h => tinycolor({ h, s: 1, v: 1 }).toHexString();
const clamp = (x, min, max) => Math.min(Math.max(x, min), max);

const normalize = (x, attr) => {
  let out;
  if ('rgb'.indexOf(attr) >= 0) {
    out = x / 255;
  } else if (attr === 'h') {
    out = x / 359;
  } else {
    out = x;
  }
  return out;
};

const denormalize = (x, attr) => {
  let out;
  if ('rgb'.indexOf(attr) >= 0) {
    out = x * 255;
  } else if (attr === 'h') {
    out = x * 359;
  } else {
    out = x;
  }
  return out;
};

const colToXy = (activeAttr, rgbhsva) => {
  let xNorm;
  let yNorm;
  if ('rgb'.indexOf(activeAttr) >= 0) {
    xNorm = activeAttr === 'b' ? rgbhsva.r / 255 : rgbhsva.b / 255;
    yNorm = activeAttr === 'g' ? 1 - rgbhsva.r / 255 : 1 - rgbhsva.g / 255;
  } else {
    xNorm = activeAttr === 'h' ? rgbhsva.s : rgbhsva.h / 359;
    yNorm = activeAttr === 'v' ? 1 - rgbhsva.s : 1 - rgbhsva.v;
  }
  return { xNorm, yNorm };
};

const xyToCol = (activeAttr, xNorm, yNorm) => {
  const out = {};
  if ('rgb'.indexOf(activeAttr) >= 0) {
    out[activeAttr === 'b' ? 'r' : 'b'] = xNorm * 255;
    out[activeAttr === 'g' ? 'r' : 'g'] = (1 - yNorm) * 255;
  } else {
    if (activeAttr === 'h') {
      out.s = xNorm;
    } else {
      out.h = xNorm * 359;
    }
    out[activeAttr === 'v' ? 's' : 'v'] = 1 - yNorm;
  }
  return out;
};

/* eslint-disable max-len */
const MANY_COLORS = '#ff0000 0%, #ff0099 10%, #cd00ff 20%, #3200ff 30%, #0066ff 40%, #00fffd 50%, #00ff66 60%, #35ff00 70%, #cdff00 80%, #ff9900 90%, #ff0000 100%';
/* eslint-enable max-len */
const GRADIENTS = {
  // Hue selector
  lightLeft: 'linear-gradient(to right, #fff 0%, transparent 100%)',
  darkBottom: 'linear-gradient(to bottom, transparent 0%, #000 100%)',
  hues: `linear-gradient(to left, ${MANY_COLORS})`,
  sLow: 'linear-gradient(to bottom, #fff 0%, #bbb 100%)',
  // Slider
  h: `linear-gradient(to bottom, ${MANY_COLORS})`,
  r: 'linear-gradient(to bottom, #ff0000 0%, #000000 100%)',
  g: 'linear-gradient(to bottom, #00ff00 0%, #000000 100%)',
  b: 'linear-gradient(to bottom, #0000ff 0%, #000000 100%)',
  v: h => `linear-gradient(to bottom, ${hueBg(h)} 0%, #000 100%)`,
  s: h => `linear-gradient(to bottom, ${hueBg(h)} 0%, #bbb 100%)`,
};

// ==========================================
// Component
// ==========================================
class ColorPicker extends React.Component {
  static propTypes = {
    registerOuterRef:       React.PropTypes.func,
    curValue:               React.PropTypes.string,
    onChange:               React.PropTypes.func.isRequired,
    disabled:               React.PropTypes.bool,
    fFocused:               React.PropTypes.bool,
    accentColor:            React.PropTypes.string,
  };
  static defaultProps = {
    accentColor:            COLORS.accent,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    this.state = {
      mode: 'hsv',
      activeAttr: 'h',
    };
    bindAll(this, [
      'onMouseDownMode',
      'onMouseDownAttrSelector',
      'onMouseDownAttrSlider',
      'onMouseMoveAttrSlider',
      'onMouseUpAttrSlider',
      'onMouseDownColorSelector',
      'onMouseMoveColorSelector',
      'onMouseUpColorSelector',
    ]);
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.onMouseMoveAttrSlider);
    window.removeEventListener('mouseup', this.onMouseUpAttrSlider);
    window.removeEventListener('mousemove', this.onMouseMoveColorSelector);
    window.removeEventListener('mouseup', this.onMouseUpColorSelector);
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { registerOuterRef, curValue } = this.props;
    const col = tinycolor(curValue);
    this.rgba = col.toRgb();
    this.hsva = col.toHsv();
    this.rgbhsva = merge(this.rgba, this.hsva);
    this.fRgb = 'rgb'.indexOf(this.state.activeAttr) >= 0;
    return (
      <div ref={registerOuterRef}
        className="giu-color-picker"
        style={style.outer(this.props)}
      >
        {this.renderColorSelector()}
        {this.renderActiveAttrSlider()}
        {this.renderControls()}
      </div>
    );
  }

  renderColorSelector() {
    const { activeAttr } = this.state;
    let gradients;
    if (this.fRgb) {
      gradients = this.renderRGBSelector(activeAttr);
    } else if (activeAttr === 'h') {
      gradients = this.renderHSelector();
    } else {
      gradients = this.renderSVSelector(activeAttr);
    }
    return (
      <div ref={c => { this.refColorSelector = c; }}
        onMouseDown={this.onMouseDownColorSelector}
        style={style.colorSelector}
      >
        {gradients}
        {this.renderSelectorValue()}
      </div>
    );
  }

  renderRGBSelector(attr) {
    const val = normalize(this.rgba[attr], attr);
    return [
      <div key="rgb1" className="giu-rgb-selector" style={style.rgbSelector(attr, val, true)} />,
      <div key="rgb2" className="giu-rgb-selector" style={style.rgbSelector(attr, val, false)} />,
    ];
  }

  renderHSelector() {
    return [
      <div key="h1" style={merge(style.selectorBase, style.hSelectorBackground(this.hsva.h))} />,
      <div key="h2" style={merge(style.selectorBase, style.hSelectorLightLeft)} />,
      <div key="h3" style={merge(style.selectorBase, style.hSelectorDarkBottom)} />,
    ];
  }

  renderSVSelector(attr) {
    const val = normalize(this.hsva[attr], attr);
    return [
      <div key="sv1" style={style.svSelector(attr, val, true)} />,
      <div key="sv2" style={style.svSelector(attr, val, false)} />,
      <div key="sv3" style={merge(style.selectorBase, style.hSelectorDarkBottom)} />,
    ];
  }

  renderSelectorValue() {
    if (!this.props.curValue) return null;
    const { xNorm, yNorm } = colToXy(this.state.activeAttr, this.rgbhsva);
    return (
      <div style={style.circleControl(xNorm, yNorm)}>
        <div style={style.circleControl2} />
      </div>
    );
  }

  renderActiveAttrSlider() {
    return (
      <div ref={c => { this.refAttrSlider = c; }}
        onMouseDown={this.onMouseDownAttrSlider}
        style={style.activeAttrSlider(this.state, this.hsva)}
      >
        {this.renderActiveAttrSliderValue()}
      </div>
    );
  }

  renderActiveAttrSliderValue() {
    if (!this.props.curValue) return null;
    const attr = this.state.activeAttr;
    const attrNorm = normalize(this.rgbhsva[attr], attr);
    return (
      <div style={style.circleControl(SLIDER_WIDTH / 2 / SIZE, 1 - attrNorm)}>
        <div style={style.circleControl2} />
      </div>
    );
  }

  renderControls() {
    const { mode, activeAttr } = this.state;
    const colorAttrs = mode.split('').map(colorAttr => {
      const fSelected = activeAttr === colorAttr;
      return (
        <div key={colorAttr}
          id={colorAttr}
          onMouseDown={this.onMouseDownAttrSelector}
          style={style.colorAttr(fSelected, this.props)}
        >
          <span style={style.colorAttrName}>
            {colorAttr.toUpperCase()}
          </span>
        </div>
      );
    });
    return (
      <div>
        <div style={flexContainer('row')}>
          {this.renderModeButton('rgb')}
          {this.renderModeButton('hsv')}
        </div>
        <div style={style.colorAttrs(this.props)}>
          {colorAttrs}
        </div>
        {this.renderSamples()}
      </div>
    );
  }

  renderModeButton(mode) {
    const fSelected = this.state.mode === mode;
    return (
      <div
        id={mode}
        onClick={this.onMouseDownMode}
        style={style.modeButton(fSelected, this.props)}
      >
        {mode.toUpperCase()}
      </div>
    );
  }

  renderSamples() {
    const { curValue } = this.props;
    if (curValue == null) return null;
    const col = tinycolor(curValue);
    return [
      <div key="sample1" style={style.sample1(col)}>{col.toHexString()}</div>,
      // <div key="sample2" style={style.sample2(col, 'white')}>Sample</div>,
      // <div key="sample3" style={style.sample2(col, 'black')}>Sample</div>,
    ];
  }

  // ==========================================
  // Event handlers
  // ==========================================
  onMouseDownMode(ev) { this.setState({ mode: ev.target.id }); }
  onMouseDownAttrSelector(ev) { this.setState({ activeAttr: ev.target.id }); }

  onMouseDownAttrSlider(ev) {
    window.addEventListener('mousemove', this.onMouseMoveAttrSlider);
    window.addEventListener('mouseup', this.onMouseUpAttrSlider);
    this.onMouseMoveAttrSlider(ev);
  }

  onMouseMoveAttrSlider(ev) {
    const bcr = this.refAttrSlider.getBoundingClientRect();
    const attrNorm = 1 - clamp((ev.clientY - bcr.top) / SIZE, 0, 1);
    const attr = this.state.activeAttr;
    this.onChange(ev, { [attr]: denormalize(attrNorm, attr) });
  }

  onMouseUpAttrSlider() {
    window.removeEventListener('mousemove', this.onMouseMoveAttrSlider);
    window.removeEventListener('mouseup', this.onMouseUpAttrSlider);
  }

  onMouseDownColorSelector(ev) {
    window.addEventListener('mousemove', this.onMouseMoveColorSelector);
    window.addEventListener('mouseup', this.onMouseUpColorSelector);
    this.onMouseMoveColorSelector(ev);
  }

  onMouseMoveColorSelector(ev) {
    const bcr = this.refColorSelector.getBoundingClientRect();
    const xNorm = clamp((ev.clientX - bcr.left) / SIZE, 0, 1);
    const yNorm = clamp((ev.clientY - bcr.top) / SIZE, 0, 1);
    const attrs = xyToCol(this.state.activeAttr, xNorm, yNorm);
    this.onChange(ev, attrs);
  }

  onMouseUpColorSelector() {
    window.removeEventListener('mousemove', this.onMouseMoveColorSelector);
    window.removeEventListener('mouseup', this.onMouseUpColorSelector);
  }

  onChange(ev, attrs) {
    const prevColor = this.fRgb ? this.rgba : this.hsva;
    const hex8 = tinycolor(merge({}, prevColor, attrs)).toHex8();
    this.props.onChange(ev, hex8);
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  outerBase: inputReset(flexContainer('row', {
    padding: 5,
  })),
  outer: ({ disabled, fFocused }) => {
    let out = style.outerBase;
    if (disabled) out = merge(out, INPUT_DISABLED);
    if (fFocused) out = merge(out, GLOW);
    return out;
  },
  colorSelector: {
    width: SIZE,
    height: SIZE,
    position: 'relative',
    cursor: 'pointer',
  },
  selectorBase: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  rgbSelector: (attr, normAttr, fHigh) => {
    let pos = 'rgb'.indexOf(attr) * (-SIZE) * 2;
    if (!fHigh) pos -= SIZE;
    return merge(style.selectorBase, {
      backgroundImage: GRADIENTS.rgb,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: `${pos}px 0`,
      opacity: fHigh ? normAttr : 1 - normAttr,
    });
  },
  hSelectorBackground: h => ({ background: hueBg(h) }),
  hSelectorLightLeft: { background: GRADIENTS.lightLeft },
  hSelectorDarkBottom: { background: GRADIENTS.darkBottom },
  svSelector: (attr, normAttr, fHigh) => {
    let background;
    if (fHigh) {
      background = GRADIENTS.hues;
    } else {
      background = attr === 'v' ? '' : GRADIENTS.sLow;
    }
    return merge(style.selectorBase, {
      background,
      opacity: fHigh ? normAttr : 1 - normAttr,
    });
  },
  activeAttrSlider: ({ activeAttr }, hsv) => {
    let background = GRADIENTS[activeAttr];
    if (typeof background === 'function') background = background(hsv.h);
    return {
      background,
      position: 'relative',
      width: SLIDER_WIDTH,
      height: SIZE,
      marginLeft: 5,
      marginRight: 5,
      cursor: 'pointer',
    };
  },
  circleControl: (x, y) => ({
    pointerEvents: 'none',
    position: 'absolute',
    top: y * SIZE - SWATCH_RADIUS,
    left: x * SIZE - SWATCH_RADIUS,
    height: 2 * SWATCH_RADIUS,
    width: 2 * SWATCH_RADIUS,
    borderRadius: SWATCH_RADIUS,
    border: '3px solid white',
  }),
  circleControl2: {
    position: 'absolute',
    top: -2,
    left: -2,
    height: (SWATCH_RADIUS - 1) * 2,
    width: (SWATCH_RADIUS - 1) * 2,
    borderRadius: SWATCH_RADIUS - 1,
    border: '1px solid black',
  },
  modeButton: (fSelected, { accentColor }) => {
    const out = {
      padding: '3px 10px',
      cursor: 'pointer',
      border: `1px solid ${accentColor}`,
    };
    out.backgroundColor = fSelected ? accentColor : undefined;
    if (fSelected) out.color = COLORS[isDark(out.backgroundColor) ? 'lightText' : 'darkText'];
    return out;
  },
  colorAttrs: ({ accentColor }) => ({
    marginTop: 5,
    border: `1px solid ${accentColor}`,
  }),
  colorAttr: (fSelected, { accentColor }) => {
    const out = {
      padding: '3px 10px',
      cursor: 'pointer',
    };
    out.backgroundColor = fSelected ? accentColor : undefined;
    if (fSelected) out.color = COLORS[isDark(out.backgroundColor) ? 'lightText' : 'darkText'];
    return out;
  },
  colorAttrName: {
    width: 40,
    pointerEvents: 'none',
  },
  sample1: (col) => {
    const backgroundColor = col.toHexString();
    const color = COLORS[isDark(backgroundColor) ? 'lightText' : 'darkText'];
    return {
      marginTop: 5,
      padding: '3px 0px',
      textAlign: 'center',
      backgroundColor, color,
    };
  },
  sample2: (col, backgroundColor) => {
    const color = col.toHexString();
    return {
      marginTop: 5,
      padding: '3px 0px',
      textAlign: 'center',
      fontWeight: 'bold',
      backgroundColor, color,
    };
  },
};

// ==========================================
// Public API
// ==========================================
export default ColorPicker;
