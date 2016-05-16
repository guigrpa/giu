import React                from 'react';
import { merge }            from 'timm';
import ColorPickerOld       from 'react-colorpickr';
import { bindAll }          from '../gral/helpers';
import { COLORS, KEYS }     from '../gral/constants';
import {
  GLOW,
  inputReset, INPUT_DISABLED,
}                           from '../gral/styles';
import input                from '../hocs/input';
import {
  floatAdd,
  floatDelete,
  floatUpdate,
  warnFloats,
}                           from '../components/floats';
import ColorPicker          from '../inputs/colorPicker';
require('./colorPicker/colorpickr.css');

function toInternalValue(val) { return val; }
function toExternalValue(val) { return val; }
function isNull(val) { return val == null; }

// ==========================================
// Component
// ==========================================
class ColorInput extends React.Component {
  static propTypes = {
    disabled:               React.PropTypes.bool,
    inlinePicker:           React.PropTypes.bool,
    onCloseFloat:           React.PropTypes.func,
    floatPosition:          React.PropTypes.string,
    floatAlign:             React.PropTypes.string,
    floatZ:                 React.PropTypes.number,
    accentColor:            React.PropTypes.string,
    // Input HOC
    curValue:               React.PropTypes.string,
    onChange:               React.PropTypes.func.isRequired,
    registerOuterRef:       React.PropTypes.func.isRequired,
    fFocused:               React.PropTypes.bool.isRequired,
    keyDown:                React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = { fFloat: false };
    bindAll(this, [
      'registerTitleRef',
      'onMouseDownTitle',
      'onClick',
      'onChange',
    ]);
  }


  componentDidMount() {
    if (!this.props.inlinePicker) {
      warnFloats(this.constructor.name);
    }
  }

  componentWillReceiveProps(nextProps) {
    const { keyDown, fFocused } = nextProps;
    if (keyDown !== this.props.keyDown) this.processKeyDown(keyDown);
    if (fFocused !== this.props.fFocused) {
      this.setState({ fFloat: fFocused });
    }
  }

  componentDidUpdate() { this.renderFloat(); }
  componentWillUnmount() { floatDelete(this.floatId); }

  // ==========================================
  // Render
  // ==========================================
  render() {
    let out;
    if (this.props.inlinePicker) {
      out = this.renderPicker();
    } else {
      out = this.renderTitle();
    }
    return out;
  }

  renderTitle() {
    return (
      <div ref={this.registerTitleRef}
        onMouseDown={this.onMouseDownTitle}
        style={style.title(this.props)}
      >
        <div style={style.swatch(this.props)} />
      </div>
    );
  }

  renderFloat() {
    if (this.props.inlinePicker) return;
    const { fFloat } = this.state;

    // Remove float
    if (!fFloat && this.floatId != null) {
      floatDelete(this.floatId);
      this.floatId = null;
      this.props.onCloseFloat && this.props.onCloseFloat();
      return;
    }

    // Create or update float
    if (fFloat) {
      const { floatZ, floatPosition, floatAlign } = this.props;
      const floatOptions = {
        position: floatPosition,
        align: floatAlign,
        zIndex: floatZ,
        getAnchorNode: () => this.refTitle,
        children: this.renderPicker(),
      };
      if (this.floatId == null) {
        this.floatId = floatAdd(floatOptions);
      } else {
        floatUpdate(this.floatId, floatOptions);
      }
    }
  }

  renderPicker() {
    const {
      inlinePicker,
      registerOuterRef,
      curValue, onChange,
      accentColor,
      disabled, fFocused,
      old,
    } = this.props;
    let picker = (
      <ColorPicker
        registerOuterRef={inlinePicker ? registerOuterRef : undefined}
        curValue={curValue}
        onChange={onChange}
        disabled={disabled}
        fFocused={inlinePicker && fFocused}
        accentColor={accentColor}
      />
    );
    if (old) picker = <ColorPickerOld value={curValue} onChange={this.onChange} />;
    if (!old || !inlinePicker) return picker;
    return (
      <div
        registerOuterRef={inlinePicker ? registerOuterRef : undefined}
        style={style.inlineWrapper(this.props)}
      >
        {picker}
      </div>
    );
  }

  // ==========================================
  // Event handlers
  // ==========================================
  registerTitleRef(c) {
    this.refTitle = c;
    this.props.registerOuterRef(c);
  }

  // If the menu is not focused, ignore it: it will be handled by the `input` HOC.
  // ...but if it is focused, we want to toggle it
  onMouseDownTitle() {
    if (!this.props.fFocused) return;
    this.setState({ fFloat: !this.state.fFloat });
  }

  onClick() {
    const { inlinePicker } = this.props;
    if (!inlinePicker) this.setState({ fFloat: false });
  }

  onChange(color) {
    const { r, g, b, a, hex } = color;
    this.props.onChange(null, hex);
  }

  // ==========================================
  // Helpers
  // ==========================================
  processKeyDown(keyDown) {
    if (keyDown.which === KEYS.esc && !this.props.inlinePicker) {
      this.setState({ fFloat: !this.state.fFloat });
    }
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  title: ({ disabled, fFocused }) => {
    let out = inputReset({
      display: 'inline-block',
      cursor: 'pointer',
      border: `1px solid ${COLORS.line}`,
      padding: 4,
    });
    if (disabled) out = merge(out, INPUT_DISABLED);
    if (fFocused) out = merge(out, GLOW);
    return out;
  },
  swatch: ({ curValue }) => {
    const background = curValue != null ? `#${curValue}` : 'transparent';
    return {
      background,
      height: 12,
      width: 26,
      borderRadius: 2,
      color: 'transparent',
    };
  },
  inlineWrapper: ({ disabled, fFocused }) => {
    let out = inputReset();
    if (disabled) out = merge(out, INPUT_DISABLED);
    if (fFocused) out = merge(out, GLOW);
    return out;
  },
};

// ==========================================
// Public API
// ==========================================
export default input(ColorInput, {
  toInternalValue, toExternalValue, isNull,
  fIncludeFocusCapture: true,
  trappedKeys: [KEYS.esc],
  className: 'giu-color-input',
});
