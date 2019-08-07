// @flow

import React from 'react';
import tinycolor from 'tinycolor2';
import { merge } from 'timm';
import classnames from 'classnames';
import { COLORS } from '../gral/constants';
import { cancelEvent } from '../gral/helpers';
import { isDark } from '../gral/styles';

const SIZE = 190;
const ALPHA_SLIDER_SIZE = 100;
const SLIDER_WIDTH = 10;

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
  className?: string,
  id?: string,
  registerOuterRef: ?Function,
  curValue: ?string,
  onChange: Function,
  disabled?: boolean,
  fFocused: boolean,
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
        className={classnames(
          'giu-input-reset giu-color-picker',
          {
            'giu-input-disabled': this.props.disabled,
            'giu-glow': this.props.fFocused,
          },
          this.props.className
        )}
        id={this.props.id}
        onMouseDown={cancelEvent}
        onClick={cancelEvent}
      >
        {this.renderMain()}
        {this.renderActiveAttrSlider()}
        {this.renderControls()}
      </div>
    );
  }

  // ------------------------------------------
  // Column 1: main
  // ------------------------------------------
  renderMain() {
    const { activeAttr } = this.state;
    let gradients;
    if (this.fRgb) gradients = this.renderMainRGB(activeAttr);
    else if (activeAttr === 'h') gradients = this.renderMainH();
    else gradients = this.renderMainSV(activeAttr);
    return (
      <div
        ref={this.refColorSelector}
        className="giu-color-picker-main"
        onMouseDown={this.onMouseDownColorSelector}
        style={{ width: SIZE, height: SIZE }}
      >
        {gradients}
        {this.renderMainValue()}
      </div>
    );
  }

  renderMainRGB(attr: string) {
    const val = normalize(this.rgba[attr], attr);
    return (
      <React.Fragment>
        <div
          className="giu-color-picker-fill giu-color-picker-main-rgb"
          style={style.mainRGB(attr, val, true)}
        />
        <div
          className="giu-color-picker-fill giu-color-picker-main-rgb"
          style={style.mainRGB(attr, val, false)}
        />
      </React.Fragment>
    );
  }

  renderMainH() {
    return (
      <React.Fragment>
        <div
          className="giu-color-picker-fill"
          style={style.mainHBackground(this.hsva.h)}
        />
        <div className="giu-color-picker-fill" style={style.mainHLightLeft} />
        <div className="giu-color-picker-fill" style={style.mainHDarkBottom} />
      </React.Fragment>
    );
  }

  renderMainSV(attr: string) {
    const val = normalize(this.hsva[attr], attr);
    return (
      <React.Fragment>
        <div
          className="giu-color-picker-fill"
          style={style.mainSV(attr, val, true)}
        />
        <div
          className="giu-color-picker-fill"
          style={style.mainSV(attr, val, false)}
        />
        <div className="giu-color-picker-fill" style={style.mainHDarkBottom} />
      </React.Fragment>
    );
  }

  renderMainValue() {
    if (!this.props.curValue) return null;
    const { xNorm, yNorm } = colToXy(this.state.activeAttr, this.rgbhsva);
    return this.renderThumb(xNorm, yNorm);
  }

  // ------------------------------------------
  // Column 2: active attribute slider
  // ------------------------------------------
  renderActiveAttrSlider() {
    let background = GRADIENTS[this.state.activeAttr];
    if (typeof background === 'function') background = background(this.hsva.h);
    return (
      <div
        ref={this.refAttrSlider}
        className="giu-color-picker-active-attr-slider"
        onMouseDown={this.onMouseDownAttrSlider}
        style={{ background, width: SLIDER_WIDTH, height: SIZE }}
      >
        {this.renderActiveAttrSliderValue()}
      </div>
    );
  }

  renderActiveAttrSliderValue() {
    if (!this.props.curValue) return null;
    const attr = this.state.activeAttr;
    const attrNorm = normalize(this.rgbhsva[attr], attr);
    return this.renderThumb(0.5, attrNorm, SLIDER_WIDTH, SIZE);
  }

  // ------------------------------------------
  // Column 3: controls
  // ------------------------------------------
  renderControls() {
    const { mode, activeAttr } = this.state;
    const colorAttrs = mode.split('').map(colorAttr => {
      return (
        <div
          key={colorAttr}
          id={colorAttr}
          className={classnames('giu-color-picker-button', {
            'giu-color-picker-button-selected': activeAttr === colorAttr,
          })}
          onMouseDown={this.onMouseDownAttrSelector}
        >
          <span className="giu-color-picker-color-attr-name">
            {colorAttr.toUpperCase()}
          </span>
        </div>
      );
    });
    return (
      <div className="giu-color-picker-control-column">
        <div className="giu-color-picker-mode-buttons">
          {this.renderModeButton('rgb')}
          {this.renderModeButton('hsv')}
        </div>
        <div className="giu-color-picker-color-attrs">{colorAttrs}</div>
        {this.renderAlphaSlider()}
        {this.renderSamples()}
      </div>
    );
  }

  renderModeButton(mode: string) {
    return (
      <div
        id={mode}
        className={classnames('giu-color-picker-button', {
          'giu-color-picker-button-selected': this.state.mode === mode,
        })}
        onMouseDown={this.onMouseDownMode}
      >
        {mode.toUpperCase()}
      </div>
    );
  }

  renderAlphaSlider() {
    const background = GRADIENTS.alpha(this.rgba);
    return (
      <div
        ref={this.refAlphaSlider}
        className="giu-color-picker-alpha-slider"
        onMouseDown={this.onMouseDownAlphaSlider}
        style={{ width: ALPHA_SLIDER_SIZE }}
      >
        <div className="giu-color-picker-fill giu-transparency-tiles" />
        <div className="giu-color-picker-fill" style={{ background }} />
        {this.renderAlphaSliderValue()}
      </div>
    );
  }

  renderAlphaSliderValue() {
    if (!this.props.curValue) return null;
    return this.renderThumb(this.rgba.a, 0.5, ALPHA_SLIDER_SIZE, SLIDER_WIDTH);
  }

  renderSamples() {
    const { curValue } = this.props;
    if (curValue == null) return null;
    const hex6 = tinycolor(curValue).toHexString();
    const color = COLORS[isDark(hex6) ? 'lightText' : 'darkText'];
    const style1 = { backgroundColor: hex6, color };
    const style2 = { backgroundColor: tinycolor(curValue).toRgbString() };
    return (
      <React.Fragment>
        <div className="giu-color-picker-labeled-swatch" style={style1}>
          #{tinycolor(curValue).toHex8()}
        </div>
        <div className="giu-color-picker-big-swatch">
          &nbsp;
          <div className="giu-color-picker-fill giu-transparency-tiles" />
          <div className="giu-color-picker-fill" style={style2} />
        </div>
      </React.Fragment>
    );
  }

  // ------------------------------------------
  // Other components
  // ------------------------------------------
  renderThumb(
    x: number,
    y: number,
    width: number = SIZE,
    height: number = SIZE
  ) {
    const top = (1 - y) * height;
    const left = x * width;
    return (
      <div className="giu-color-picker-thumb-wrapper" style={{ top, left }}>
        <div className="giu-color-picker-thumb-1" />
        <div className="giu-color-picker-thumb-2" />
      </div>
    );
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
  mainRGB: (attr, normAttr, fHigh) => {
    let pos = 'rgb'.indexOf(attr) * -SIZE * 2;
    if (!fHigh) pos -= SIZE;
    return {
      backgroundRepeat: 'no-repeat',
      backgroundPosition: `${pos}px 0`,
      opacity: fHigh ? normAttr : 1 - normAttr,
    };
  },
  mainHBackground: h => ({ background: hueBg(h) }),
  mainHLightLeft: { background: GRADIENTS.lightLeft },
  mainHDarkBottom: { background: GRADIENTS.darkBottom },
  mainSV: (attr, normAttr, fHigh) => {
    let background;
    if (fHigh) background = GRADIENTS.hues;
    else background = attr === 'v' ? '' : GRADIENTS.sLow;
    return { background, opacity: fHigh ? normAttr : 1 - normAttr };
  },
};

// ==========================================
// Public
// ==========================================
export default ColorPicker;
