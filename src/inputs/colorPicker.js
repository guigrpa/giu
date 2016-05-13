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
import { scrollIntoView }   from '../gral/visibility';
import {
  isDark,
  flexContainer, flexItem,
  inputReset, INPUT_DISABLED,
  GLOW,
}                           from '../gral/styles';
import hoverable            from '../hocs/hoverable';
import RadioGroup           from '../inputs/radioGroup';
import { NumberInput }      from '../inputs/textNumberInput';

const hueBg = h => tinycolor({ h, s: 100, v: 100 }).toHexString();

const GRADIENTS = {
  /* eslint-disable max-len */
  h: 'linear-gradient(to bottom, #ff0000 0%, #ff0099 10%, #cd00ff 20%, #3200ff 30%, #0066ff 40%, #00fffd 50%, #00ff66 60%, #35ff00 70%, #cdff00 80%, #ff9900 90%, #ff0000 100%)',
  /* eslint-enable max-len */
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
    curValue:               React.PropTypes.string.isRequired,
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
      'onMouseDownComponent',
    ]);
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { registerOuterRef, curValue } = this.props;
    const col = tinycolor(curValue);
    this.rgb = col.toRgb();
    this.hsv = col.toHsv();
    return (
      <div ref={registerOuterRef}
        className="giu-color-picker"
        style={style.outer(this.props)}
      >
        {this.renderXY()}
        {this.renderGradient()}
        {this.renderControls()}
      </div>
    );
  }

  renderXY() {
    return (
      <div>
        xy
      </div>
    );
  }

  renderGradient() {
    return (
      <div
        style={style.activeAttrSlider(this.state, this.hsv)}
      />
    );
  }

  renderControls() {
    const { mode, activeAttr } = this.state;
    const colorAttrs = mode.split('').map(colorAttr => {
      const fSelected = activeAttr === colorAttr;
      return (
        <div key={colorAttr}
          id={colorAttr}
          onMouseDown={this.onMouseDownComponent}
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

  // ==========================================
  // Event handlers
  // ==========================================
  onMouseDownMode(ev) { this.setState({ mode: ev.target.id }); }
  onMouseDownComponent(ev) { this.setState({ activeAttr: ev.target.id }); }

  // ==========================================
  // Helpers
  // ==========================================
}

// ==========================================
// Styles
// ==========================================
const style = {
  outerBase: inputReset(flexContainer('row', {
    padding: 3,
  })),
  outer: ({ disabled, fFocused }) => {
    let out = style.outerBase;
    if (disabled) out = merge(out, INPUT_DISABLED);
    if (fFocused) out = merge(out, GLOW);
    return out;
  },
  activeAttrSlider: ({ activeAttr }, hsv) => {
    let background = GRADIENTS[activeAttr];
    if (typeof background === 'function') background = background(hsv.h);
    return {
      background,
      width: 10,
      height: 150,
      marginRight: 3,
    };
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
};

// ==========================================
// Public API
// ==========================================
export default ColorPicker;
