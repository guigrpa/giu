import React                from 'react';
import { merge }            from 'timm';
import tinycolor            from 'tinycolor2';
import {
  COLORS,
  KEYS,
  IS_IOS,
}                           from '../gral/constants';
import {
  GLOW,
  inputReset, INPUT_DISABLED,
}                           from '../gral/styles';
import input                from '../hocs/input';
import {
  floatAdd,
  floatDelete,
  floatUpdate,
}                           from '../components/floats';
import ColorPicker          from '../inputs/colorPicker';
import IosFloatWrapper      from '../inputs/iosFloatWrapper';

function toInternalValue(val) { return val; }
function toExternalValue(val) { return val; }
function isNull(val) { return val == null; }

const SWATCH_WIDTH = 25;
const SWATCH_HEIGHT = 10;

// ==========================================
// Component
// ==========================================
// -- Props:
// --
// -- * **inlinePicker** *boolean?*: whether the complete color picker
// --   should be inlined (`true`) or appear as a dropdown when clicked
// -- * **onCloseFloat** *function?*
// -- * **accentColor** *string?*: CSS color descriptor (e.g. `darkgray`, `#ccffaa`...)
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
      // The `x` text keeps baselines aligned
      <div ref={this.registerTitleRef}
        onMouseDown={this.onMouseDownTitle}
        style={style.title(this.props)}
      >
        x
        <div
          className="giu-transparency-tiles"
          style={style.swatchTiles}
        />
        <div style={style.swatch(this.props)} />
        {IS_IOS && this.renderFloatForIos()}
      </div>
    );
  }

  renderFloat() {
    if (this.props.inlinePicker) return;
    if (IS_IOS) return;
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

  renderFloatForIos() {
    if (!this.state.fFloat) return null;
    const { floatPosition, floatAlign, floatZ } = this.props;
    return (
      <IosFloatWrapper
        floatPosition={floatPosition}
        floatAlign={floatAlign}
        floatZ={floatZ}
      >
        {this.renderPicker()}
      </IosFloatWrapper>
    );
  }

  renderPicker() {
    const {
      inlinePicker,
      registerOuterRef,
      curValue, onChange,
      accentColor,
      disabled, fFocused,
    } = this.props;
    return (
      <ColorPicker
        registerOuterRef={inlinePicker ? registerOuterRef : undefined}
        curValue={curValue}
        onChange={onChange}
        disabled={disabled}
        fFocused={inlinePicker && fFocused}
        accentColor={accentColor}
      />
    );
  }

  // ==========================================
  // Event handlers
  // ==========================================
  registerTitleRef = (c) => {
    this.refTitle = c;
    this.props.registerOuterRef(c);
  }

  // If the menu is not focused, ignore it: it will be handled by the `input` HOC.
  // ...but if it is focused, we want to toggle it
  onMouseDownTitle = () => {
    if (!this.props.fFocused) return;
    this.setState({ fFloat: !this.state.fFloat });
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
      position: 'relative',
      cursor: 'pointer',
      border: `1px solid ${COLORS.line}`,
      padding: '2px 4px 6px 4px',
      height: SWATCH_HEIGHT + 2 * 4 + 2,
      width: SWATCH_WIDTH + 2 * 4 + 2,
      color: 'transparent', // hide the placeholder text that keeps baselines aligned
      lineHeight: '1em',
    });
    if (disabled) out = merge(out, INPUT_DISABLED);
    if (fFocused) out = merge(out, GLOW);
    return out;
  },
  swatchTiles: {
    position: 'absolute',
    top: 4, right: 4, bottom: 4, left: 4,
    borderRadius: 2,
  },
  swatch: ({ curValue }) => {
    const col = tinycolor(curValue).toRgbString();
    const background = curValue != null ? `${col}` : 'transparent';
    return {
      position: 'absolute',
      top: 4,
      right: 4,
      bottom: 4,
      left: 4,
      borderRadius: 2,
      background,
    };
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
