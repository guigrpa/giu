// @flow

import React from 'react';
import tinycolor from 'tinycolor2';
import { merge } from 'timm';
import { COLORS } from '../gral/constants';
import { cancelEvent } from '../gral/helpers';
import {
  isDark,
  flexContainer,
  flexItem,
  inputReset,
  INPUT_DISABLED,
  GLOW,
} from '../gral/styles';

const SIZE = 190;
const ALPHA_SLIDER_SIZE = 100;
const SLIDER_WIDTH = 10;
const SWATCH_RADIUS = 6;

const hueBg = h => tinycolor({ h, s: 1, v: 1 }).toHexString();
const clamp = (x, min, max) => Math.min(Math.max(x, min), max);

const normalize = (x, attr) => {
  if ('rgb'.indexOf(attr) >= 0) return x / 255;
  if (attr === 'h') return x / 359;
  return x;
};

const denormalize = (x, attr) => {
  if ('rgb'.indexOf(attr) >= 0) return x * 255;
  if (attr === 'h') return x * 359;
  return x;
};

const colToXy = (activeAttr, rgbhsva) => {
  let xNorm;
  let yNorm;
  if ('rgb'.indexOf(activeAttr) >= 0) {
    xNorm = activeAttr === 'b' ? rgbhsva.r / 255 : rgbhsva.b / 255;
    yNorm = activeAttr === 'g' ? rgbhsva.r / 255 : rgbhsva.g / 255;
  } else {
    xNorm = activeAttr === 'h' ? rgbhsva.s : rgbhsva.h / 359;
    yNorm = activeAttr === 'v' ? rgbhsva.s : rgbhsva.v;
  }
  return { xNorm, yNorm };
};

const xyToCol = (activeAttr, xNorm, yNorm) => {
  const out = {};
  if ('rgb'.indexOf(activeAttr) >= 0) {
    out[activeAttr === 'b' ? 'r' : 'b'] = xNorm * 255;
    out[activeAttr === 'g' ? 'r' : 'g'] = yNorm * 255;
  } else {
    if (activeAttr === 'h') {
      out.s = xNorm;
    } else {
      out.h = xNorm * 359;
    }
    out[activeAttr === 'v' ? 's' : 'v'] = yNorm;
  }
  return out;
};

/* eslint-disable max-len */
const MANY_COLORS =
  '#ff0000 0%, #ff0099 10%, #cd00ff 20%, #3200ff 30%, #0066ff 40%, #00fffd 50%, #00ff66 60%, #35ff00 70%, #cdff00 80%, #ff9900 90%, #ff0000 100%';
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
  alpha: ({ r, g, b }) =>
    `linear-gradient(to right, rgba(${r}, ${g}, ${b}, 0), rgb(${r}, ${g}, ${b}))`,
};

// ==========================================
// Declarations
// ==========================================
type Props = {|
  registerOuterRef: ?Function,
  curValue: ?string,
  onChange: Function,
  disabled?: boolean,
  fFocused: boolean,
  accentColor: string,
|};

type State = {
  mode: string,
  activeAttr: string,
};

// ==========================================
// Component
// ==========================================
class ColorPicker extends React.PureComponent<Props, State> {
  rgba: Object;
  hsva: Object;
  rgbhsva: Object;
  fRgb: boolean;

  state = { mode: 'hsv', activeAttr: 'h' };
  refAlphaSlider: any = React.createRef();
  refColorSelector: any = React.createRef();
  refAttrSlider: any = React.createRef();

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.onMouseMoveColorSelector);
    window.removeEventListener('mouseup', this.onMouseUpColorSelector);
    window.removeEventListener('mousemove', this.onMouseMoveAttrSlider);
    window.removeEventListener('mouseup', this.onMouseUpAttrSlider);
    window.removeEventListener('mousemove', this.onMouseMoveAlphaSlider);
    window.removeEventListener('mouseup', this.onMouseUpAlphaSlider);
  }

  // ==========================================
  render() {
    const { registerOuterRef, curValue } = this.props;
    const col = tinycolor(curValue);
    const rgba = col.toRgb();
    if (
      !this.rgba ||
      rgba.r !== this.rgba.r ||
      rgba.g !== this.rgba.g ||
      rgba.b !== this.rgba.b ||
      rgba.a !== this.rgba.a
    ) {
      this.rgba = rgba;
      this.hsva = col.toHsv();
    }
    this.rgbhsva = merge(this.rgba, this.hsva);
    this.fRgb = 'rgb'.indexOf(this.state.activeAttr) >= 0;
    return (
      <div
        ref={registerOuterRef}
        className="giu-color-picker"
        onMouseDown={cancelEvent}
        onClick={cancelEvent}
        style={style.outer(this.props)}
      >
        {this.renderColorSelector()}
        {this.renderActiveAttrSlider()}
        {this.renderControls()}
      </div>
    );
  }

  // ------------------------------------------
  // Column 1: color selector
  // ------------------------------------------
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
      <div
        ref={this.refColorSelector}
        onMouseDown={this.onMouseDownColorSelector}
        style={style.colorSelector}
      >
        {gradients}
        {this.renderSelectorValue()}
      </div>
    );
  }

  renderRGBSelector(attr: string) {
    const val = normalize(this.rgba[attr], attr);
    return [
      <div
        key="rgb1"
        className="giu-rgb-selector"
        style={style.rgbSelector(attr, val, true)}
      />,
      <div
        key="rgb2"
        className="giu-rgb-selector"
        style={style.rgbSelector(attr, val, false)}
      />,
    ];
  }

  renderHSelector() {
    return [
      <div
        key="h1"
        style={merge(
          style.selectorBase,
          style.hSelectorBackground(this.hsva.h)
        )}
      />,
      <div
        key="h2"
        style={merge(style.selectorBase, style.hSelectorLightLeft)}
      />,
      <div
        key="h3"
        style={merge(style.selectorBase, style.hSelectorDarkBottom)}
      />,
    ];
  }

  renderSVSelector(attr: string) {
    const val = normalize(this.hsva[attr], attr);
    return [
      <div key="sv1" style={style.svSelector(attr, val, true)} />,
      <div key="sv2" style={style.svSelector(attr, val, false)} />,
      <div
        key="sv3"
        style={merge(style.selectorBase, style.hSelectorDarkBottom)}
      />,
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

  // ------------------------------------------
  // Column 2: active attribute slider
  // ------------------------------------------
  renderActiveAttrSlider() {
    return (
      <div
        ref={this.refAttrSlider}
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
      <div style={style.circleControl(0.5, attrNorm, SLIDER_WIDTH, SIZE)}>
        <div style={style.circleControl2} />
      </div>
    );
  }

  // ------------------------------------------
  // Column 3: controls
  // ------------------------------------------
  renderControls() {
    const { mode, activeAttr } = this.state;
    const colorAttrs = mode.split('').map(colorAttr => {
      const fSelected = activeAttr === colorAttr;
      return (
        <div
          key={colorAttr}
          id={colorAttr}
          onMouseDown={this.onMouseDownAttrSelector}
          style={style.colorAttr(fSelected, this.props)}
        >
          <span style={style.colorAttrName}>{colorAttr.toUpperCase()}</span>
        </div>
      );
    });
    return (
      <div style={style.controlColumn}>
        <div style={style.modeButtons(this.props)}>
          {this.renderModeButton('rgb')}
          {this.renderModeButton('hsv')}
        </div>
        <div style={style.colorAttrs(this.props)}>{colorAttrs}</div>
        {this.renderAlphaSlider()}
        {this.renderSamples()}
      </div>
    );
  }

  renderModeButton(mode: string) {
    const fSelected = this.state.mode === mode;
    return (
      <div
        id={mode}
        onMouseDown={this.onMouseDownMode}
        style={style.modeButton(fSelected, this.props)}
      >
        {mode.toUpperCase()}
      </div>
    );
  }

  renderAlphaSlider() {
    return (
      <div
        ref={this.refAlphaSlider}
        onMouseDown={this.onMouseDownAlphaSlider}
        style={style.alphaSlider}
      >
        <div className="giu-transparency-tiles" style={style.fillWithTiles} />
        <div style={style.alphaSliderGradient(this.rgba)} />
        {this.renderAlphaSliderValue()}
      </div>
    );
  }

  renderAlphaSliderValue() {
    if (!this.props.curValue) return null;
    return (
      <div
        style={style.circleControl(
          this.rgba.a,
          0.5,
          ALPHA_SLIDER_SIZE,
          SLIDER_WIDTH
        )}
      >
        <div style={style.circleControl2} />
      </div>
    );
  }

  // ------------------------------------------
  // Samples
  // ------------------------------------------
  renderSamples() {
    const { curValue } = this.props;
    if (curValue == null) return null;
    const hex6 = tinycolor(curValue).toHexString();
    const rgbaStr = tinycolor(curValue).toRgbString();
    return [
      <div key="sample1" style={style.sample1(hex6)}>
        #{tinycolor(curValue).toHex8()}
      </div>,
      <div key="sample2" style={style.sample2}>
        &nbsp;
        <div className="giu-transparency-tiles" style={style.fillWithTiles} />
        <div style={style.sample2Swatch(rgbaStr)} />
      </div>,
    ];
  }

  // ==========================================
  onMouseDownMode = (ev: any) => {
    const mode = ev.target.id;
    if (mode === this.state.mode) return;
    const activeAttr = mode[0];
    this.setState({ mode, activeAttr });
  };
  onMouseDownAttrSelector = (ev: any) => {
    this.setState({ activeAttr: ev.target.id });
  };

  onMouseDownColorSelector = (ev: any) => {
    window.addEventListener('mousemove', this.onMouseMoveColorSelector);
    window.addEventListener('mouseup', this.onMouseUpColorSelector);
    this.onMouseMoveColorSelector(ev);
  };
  onMouseMoveColorSelector = (ev: any) => {
    if (this.refColorSelector.current == null) return;
    const bcr = this.refColorSelector.current.getBoundingClientRect();
    const xNorm = clamp((ev.clientX - bcr.left) / SIZE, 0, 1);
    const yNorm = 1 - clamp((ev.clientY - bcr.top) / SIZE, 0, 1);
    const attrs = xyToCol(this.state.activeAttr, xNorm, yNorm);
    this.onChange(ev, attrs);
  };
  onMouseUpColorSelector = () => {
    window.removeEventListener('mousemove', this.onMouseMoveColorSelector);
    window.removeEventListener('mouseup', this.onMouseUpColorSelector);
  };

  onMouseDownAttrSlider = (ev: any) => {
    window.addEventListener('mousemove', this.onMouseMoveAttrSlider);
    window.addEventListener('mouseup', this.onMouseUpAttrSlider);
    this.onMouseMoveAttrSlider(ev);
  };
  onMouseMoveAttrSlider = (ev: any) => {
    if (this.refAttrSlider.current == null) return;
    const bcr = this.refAttrSlider.current.getBoundingClientRect();
    const attrNorm = 1 - clamp((ev.clientY - bcr.top) / SIZE, 0, 1);
    const attr = this.state.activeAttr;
    this.onChange(ev, { [attr]: denormalize(attrNorm, attr) });
  };
  onMouseUpAttrSlider = () => {
    window.removeEventListener('mousemove', this.onMouseMoveAttrSlider);
    window.removeEventListener('mouseup', this.onMouseUpAttrSlider);
  };

  onMouseDownAlphaSlider = (ev: any) => {
    window.addEventListener('mousemove', this.onMouseMoveAlphaSlider);
    window.addEventListener('mouseup', this.onMouseUpAlphaSlider);
    this.onMouseMoveAlphaSlider(ev);
  };
  onMouseMoveAlphaSlider = (ev: any) => {
    if (this.refAlphaSlider.current == null) return;
    const bcr = this.refAlphaSlider.current.getBoundingClientRect();
    const attrNorm = clamp((ev.clientX - bcr.left) / ALPHA_SLIDER_SIZE, 0, 1);
    this.onChange(ev, { a: attrNorm });
  };
  onMouseUpAlphaSlider = () => {
    window.removeEventListener('mousemove', this.onMouseMoveAlphaSlider);
    window.removeEventListener('mouseup', this.onMouseUpAlphaSlider);
  };

  onChange(ev: any, attrs: Object) {
    let hex8;
    if (this.fRgb) {
      hex8 = tinycolor(merge({}, this.rgba, attrs)).toHex8();
    } else {
      // In HSV mode, we need to avoid singularities (e.g. at v = 0).
      // We keep the HSV values chosen by the user in `this.hsva` and
      // don't modify them when the RGB value doesn't change (see `render()`).
      // If `hex8` doesn't change, we trigger a forceUpdate() here, so that
      // the control reflects the updated value (no owner element will trigger
      // this refresh, since the control's `value` has not changed).
      const prevHex8 = tinycolor(merge({}, this.hsva)).toHex8();
      this.hsva = merge(this.hsva, attrs);
      const col = tinycolor(merge({}, this.hsva, attrs));
      this.rgba = col.toRgb();
      hex8 = col.toHex8();
      if (hex8 === prevHex8) this.forceUpdate();
    }
    this.props.onChange(ev, tinycolor(hex8).toRgbString());
  }
}

// ==========================================
const style = {
  outerBase: inputReset(flexContainer('row', { padding: 6 })),
  outer: ({ disabled, fFocused }) => {
    let out = style.outerBase;
    if (disabled) out = merge(out, INPUT_DISABLED);
    if (fFocused) out = merge(out, GLOW);
    return out;
  },

  // Color selector
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
    let pos = 'rgb'.indexOf(attr) * -SIZE * 2;
    if (!fHigh) pos -= SIZE;
    return merge(style.selectorBase, {
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

  // Active attr slider
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

  // Control column
  controlColumn: flexContainer('column'),
  modeButtons: ({ accentColor }) =>
    flexContainer('row', {
      border: `1px solid ${accentColor}`,
    }),
  modeButton: (fSelected, { accentColor }) => {
    const out = flexItem(1, {
      padding: 3,
      textAlign: 'center',
      cursor: 'pointer',
    });
    if (fSelected) {
      out.backgroundColor = accentColor;
      out.color = COLORS[isDark(accentColor) ? 'lightText' : 'darkText'];
    }
    return out;
  },
  colorAttrs: ({ accentColor }) =>
    flexContainer('row', {
      marginTop: 5,
      border: `1px solid ${accentColor}`,
    }),
  colorAttr: (fSelected, { accentColor }) => {
    const out = flexItem(1, {
      padding: 3,
      textAlign: 'center',
      cursor: 'pointer',
    });
    if (fSelected) {
      out.backgroundColor = accentColor;
      out.color = COLORS[isDark(accentColor) ? 'lightText' : 'darkText'];
    }
    return out;
  },
  colorAttrName: {
    width: 40,
    pointerEvents: 'none',
  },
  alphaSlider: {
    marginTop: 5,
    position: 'relative',
    height: SLIDER_WIDTH,
    width: ALPHA_SLIDER_SIZE,
    cursor: 'pointer',
  },
  alphaSliderGradient: rgba => ({
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    background: GRADIENTS.alpha(rgba),
  }),
  sample1: hex6 => {
    const backgroundColor = hex6;
    const color = COLORS[isDark(backgroundColor) ? 'lightText' : 'darkText'];
    return {
      marginTop: 5,
      padding: '3px 0px',
      textAlign: 'center',
      backgroundColor,
      color,
    };
  },
  sample2: flexItem(1, {
    marginTop: 5,
    position: 'relative',
    padding: '3px 0px',
    textAlign: 'center',
    fontWeight: 'bold',
  }),
  sample2Swatch: rgbaStr => ({
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: rgbaStr,
    borderRadius: 2,
  }),

  // General
  fillWithTiles: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    borderRadius: 2,
  },
  circleControl: (x, y, width = SIZE, height = SIZE) => ({
    pointerEvents: 'none',
    position: 'absolute',
    top: (1 - y) * height - SWATCH_RADIUS,
    left: x * width - SWATCH_RADIUS,
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
};

// ==========================================
// Public
// ==========================================
export default ColorPicker;
