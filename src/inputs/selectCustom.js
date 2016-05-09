import React                from 'react';
import {
  omit,
  set as timmSet,
}                           from 'timm';
import {
  bindAll,
  cancelEvent,
}                           from '../gral/helpers';
import {
  COLORS, KEYS,
  NULL_STRING,
}                           from '../gral/constants';
import input                from '../hocs/input';
import focusCapture         from '../hocs/focusCapture';
import {
  ListPicker,
  LIST_SEPARATOR,
}                           from '../inputs/listPicker';
import {
  floatAdd,
  floatDelete,
  floatUpdate,
  warnFloats,
}                           from '../components/floats';

function toInternalValue(val) { return val != null ? JSON.stringify(val) : NULL_STRING; }
function toExternalValue(val) { return val !== NULL_STRING ? JSON.parse(val) : null; }

// ==========================================
// Component
// ==========================================
class Select extends React.Component {
  static propTypes = {
    disabled:               React.PropTypes.bool,
    items:                  React.PropTypes.array.isRequired,
    allowNull:              React.PropTypes.bool,
    inlinePicker:           React.PropTypes.bool,
    children:               React.PropTypes.object,
    styleList:              React.PropTypes.object,
    twoStageStyle:          React.PropTypes.bool,
    accentColor:            React.PropTypes.string,
    // Input HOC
    curValue:               React.PropTypes.string.isRequired,
    registerOuterRef:       React.PropTypes.func.isRequired,
    fFocused:               React.PropTypes.bool.isRequired,
    // FocusCapture HOC
    keyDown:                React.PropTypes.object,
  };
  static defaultProps = {
    accentColor:            COLORS.accent,
  };

  constructor(props) {
    super(props);
    this.state = { fFloat: false };
    bindAll(this, [
      'registerTitleRef',
    ]);
  }

  componentWillMount() {
    this.prepareItems(this.props.items, this.props.allowNull);
  }

  componentDidMount() { warnFloats(this.constructor.name); }

  componentWillReceiveProps(nextProps) {
    const { keyDown, items, allowNull, fFocused } = nextProps;
    if (keyDown !== this.props.keyDown) this.processKeyDown(keyDown);
    if (items !== this.props.items || allowNull !== this.props.allowNull) {
      this.prepareItems(items, allowNull);
    }
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
    if (this.props.inlinePicker) {
      return this.renderInline();
    } else {
      return this.renderTitle();
    }
  }

  renderTitle() {
    const {
      children,
    } = this.props;
    return (
      <div ref={this.registerTitleRef}>
        {children}
      </div>
    );
  }

  renderInline() {
    const {
      registerOuterRef,
      curValue, onChange,
      disabled, fFocused,
      styleList,
      twoStageStyle, accentColor,
    } = this.props;
    return (
      <ListPicker
        registerOuterRef={registerOuterRef}
        items={this.items}
        curValue={curValue}
        onChange={onChange}
        keyDown={this.keyDown}
        disabled={disabled}
        fFocused={fFocused}
        style={styleList}
        twoStageStyle={twoStageStyle}
        accentColor={accentColor}
      />
    );
  }

  renderFloat() {
    if (this.props.inlinePicker) return;
    const { fFloat } = this.state;

    // Remove float
    if (!fFloat && this.floatId != null) {
      floatDelete(this.floatId);
      this.floatId = null;
      return;
    }

    // Create or update float
    if (fFloat) {
      const { floatZ, floatPosition, floatAlign } = this.props;
      const floatOptions = {
        position: floatPosition,
        align: floatAlign,
        zIndex: floatZ,
        limitSize: true,
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
      curValue, onChange,
      disabled,
      styleList,
      twoStageStyle, accentColor,
    } = this.props;
    return (
      <ListPicker
        items={this.items}
        curValue={curValue}
        onChange={onChange}
        keyDown={this.keyDown}
        disabled={disabled}
        style={styleList}
        twoStageStyle={twoStageStyle}
        accentColor={accentColor}
      />
    );
  }

  // ==========================================
  // Handlers
  // ==========================================
  registerTitleRef(c) { this.refTitle = c; }

  // ==========================================
  // Helpers
  // ==========================================
  processKeyDown(keyDown) {
    if (keyDown.which === KEYS.esc && !this.props.inlinePicker) {
      this.setState({ fFloat: !this.state.fFloat });
      this.keyDown = undefined;
      return;
    }
    this.keyDown = keyDown;
  }

  prepareItems(items, allowNull) {
    this.items = [];
    if (allowNull) this.items.push({ value: NULL_STRING, label: '' });
    items.forEach(item => {
      const { value } = item;
      if (value === LIST_SEPARATOR.value) {
        this.items.push(item);
        return;
      }
      const newItem = timmSet(item, 'value', toInternalValue(value));
      this.items.push(newItem);
    });
  }
}

// ==========================================
// Styles
// ==========================================
// const style = {};

// ==========================================
// Public API
// ==========================================
const SelectWithFocusCapture = focusCapture(Select, {
  className: 'giu-select-custom',
  trappedKeys: [
    KEYS.esc,
    // For ListPicker
    KEYS.down, KEYS.up,
    KEYS.home, KEYS.end,
    KEYS.return, KEYS.del, KEYS.backspace,
  ],
});
export default input(SelectWithFocusCapture, {
  toInternalValue, toExternalValue,
});
