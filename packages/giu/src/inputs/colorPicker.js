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
type PublicProps = {|
  registerOuterRef: ?Function,
  curValue: ?string,
  onChange: Function,
  disabled?: boolean,
  fFocused: boolean,
  accentColor?: string,
|};

type DefaultProps = {|
  accentColor: string,
|};

type Props = {
  ...PublicProps,
  ...DefaultProps,
};

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

  static defaultProps: DefaultProps = {
    accentColor: COLORS.accent,
  };
  state = { mode: 'hsv', activeAttr: 'h' };
  refAlphaSlider = React.createRef();
  refColorSelector = React.createRef();
  refAttrSlider = React.createRef();

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
      rgba.b !== this.rgba.b
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
        style={style.outer(this.props)}
      >
        {this.renderColorSelector()}
        {this.renderActiveAttrSlider()}
        {this.renderControls()}
        {STYLES}
      </div>
    );
  }

  // ------------------------------------------
  // Color selector
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
  // Active attribute slider
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
  // Controls
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

      // In HSV mode, we need to avoid singularities (e.g. at v = 0).
      // We keep the HSV values chosen by the user in `this.hsva` and
      // don't modify them when the RGB value doesn't change (see `render()`).
      // If `hex8` doesn't change, we trigger a forceUpdate() here, so that
      // the control reflects the updated value (no owner element will trigger
      // this refresh, since the control's `value` has not changed).
    } else {
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

const STYLES = (
  <style jsx global>{`
    .giu-rgb-selector {
      background-image: url('data:image/png;base64,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');
    }

    .giu-transparency-tiles {
      background-image: url('data:image/png;base64,R0lGODdhCgAKAPAAAOXl5f///ywAAAAACgAKAEACEIQdqXt9GxyETrI279OIgwIAOw==');
    }
  `}</style>
);

// ==========================================
// Public
// ==========================================
export default ColorPicker;
