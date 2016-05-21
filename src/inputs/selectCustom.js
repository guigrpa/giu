import React                from 'react';
import { merge }            from 'timm';
import { bindAll }          from '../gral/helpers';
import {
  COLORS, KEYS,
  UNICODE,
  NULL_STRING,
}                           from '../gral/constants';
import {
  flexContainer, flexItem,
  GLOW,
  inputReset, INPUT_DISABLED,
}                           from '../gral/styles';
import {
  createShortcut,
  registerShortcut,
  unregisterShortcut,
}                           from '../gral/keys';
import input                from '../hocs/input';
import {
  ListPicker,
  LIST_SEPARATOR_KEY,
}                           from '../inputs/listPicker';
import {
  floatAdd,
  floatDelete,
  floatUpdate,
  warnFloats,
}                           from '../components/floats';
import Icon                 from '../components/icon';

const LIST_SEPARATOR = {
  value: LIST_SEPARATOR_KEY,
  label: LIST_SEPARATOR_KEY,
};

function toInternalValue(val) { return val != null ? JSON.stringify(val) : NULL_STRING; }
function toExternalValue(val) { return val !== NULL_STRING ? JSON.parse(val) : null; }
function isNull(val) { return val === NULL_STRING; }

// ==========================================
// Component
// ==========================================
class SelectCustomBase extends React.Component {
  static propTypes = {
    disabled:               React.PropTypes.bool,
    items:                  React.PropTypes.array.isRequired,
    required:               React.PropTypes.bool,
    inlinePicker:           React.PropTypes.bool,
    children:               React.PropTypes.any,
    onClickItem:            React.PropTypes.func,
    onCloseFloat:           React.PropTypes.func,
    floatPosition:          React.PropTypes.string,
    floatAlign:             React.PropTypes.string,
    floatZ:                 React.PropTypes.number,
    style:                  React.PropTypes.object,
    twoStageStyle:          React.PropTypes.bool,
    accentColor:            React.PropTypes.string,
    // Input HOC
    curValue:               React.PropTypes.string.isRequired,
    onChange:               React.PropTypes.func.isRequired,
    registerOuterRef:       React.PropTypes.func.isRequired,
    fFocused:               React.PropTypes.bool.isRequired,
    keyDown:                React.PropTypes.object,
  };
  static defaultProps = {
    accentColor:            COLORS.accent,
  };

  constructor(props) {
    super(props);
    this.state = { fFloat: false };
    this.keyDown = undefined;
    bindAll(this, [
      'registerTitleRef',
      'onMouseDownTitle',
      'onClickItem',
    ]);
  }

  componentWillMount() {
    this.prepareItems(this.props.items, this.props.required);
  }

  componentDidMount() {
    if (!this.props.inlinePicker) {
      warnFloats(this.constructor.name);
    }
    this.registerShortcuts();
  }

  componentWillReceiveProps(nextProps) {
    const { keyDown, items, required, fFocused } = nextProps;
    if (keyDown !== this.props.keyDown) this.processKeyDown(keyDown);
    if (items !== this.props.items || required !== this.props.required) {
      this.unregisterShortcuts();
      this.prepareItems(items, required);
    }
    if (fFocused !== this.props.fFocused) {
      this.setState({ fFloat: fFocused });
    }
  }

  componentDidUpdate() {
    this.renderFloat();
  }

  componentWillUnmount() {
    floatDelete(this.floatId);
    this.unregisterShortcuts();
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    let out;
    if (this.props.inlinePicker) {
      out = this.renderPicker();
    } else if (this.props.children) {
      out = this.renderProvidedTitle();
    } else {
      out = this.renderDefaultTitle();
    }
    return out;
  }

  renderProvidedTitle() {
    return React.cloneElement(this.props.children, {
      ref: this.registerTitleRef,
    });
  }

  renderDefaultTitle() {
    const { curValue } = this.props;
    let label = UNICODE.nbsp;
    if (curValue !== NULL_STRING) {
      for (let i = 0; i < this.items.length; i++) {
        if (this.items[i].value === curValue) {
          label = this.items[i].label;
          break;
        }
      }
    }
    const caretIcon = this.state.fFloat ? 'caret-up' : 'caret-down';
    return (
      <span ref={this.registerTitleRef}
        className="giu-select-custom"
        onMouseDown={this.onMouseDownTitle}
        style={style.title(this.props)}
      >
        {label}
        <span style={flexItem(1)} />
        <Icon icon={caretIcon} style={style.caret} />
      </span>
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
      inlinePicker,
      registerOuterRef,
      curValue, onChange,
      disabled, fFocused,
      style: styleList,
      twoStageStyle, accentColor,
    } = this.props;
    return (
      <ListPicker
        registerOuterRef={inlinePicker ? registerOuterRef : undefined}
        items={this.items}
        curValue={curValue}
        onChange={onChange}
        onClickItem={this.onClickItem}
        keyDown={this.keyDown}
        disabled={disabled}
        fFocused={inlinePicker && fFocused}
        fFloating={!inlinePicker}
        style={styleList}
        twoStageStyle={twoStageStyle}
        accentColor={accentColor}
      />
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

  onClickItem(ev, nextValue) {
    const { inlinePicker } = this.props;
    if (!inlinePicker) this.setState({ fFloat: false });
    this.props.onClickItem && this.props.onClickItem(ev, nextValue);
  }

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

  prepareItems(rawItems, required) {
    this.items = [];
    if (!required && rawItems.length) {
      this.items.push({
        value: NULL_STRING,
        label: '',
        shortcuts: [],
      });
    }
    rawItems.forEach(item => {
      const { value } = item;
      if (value === LIST_SEPARATOR_KEY) {
        this.items.push({
          value: LIST_SEPARATOR_KEY,
          label: LIST_SEPARATOR_KEY,
          shortcuts: [],
        });
        return;
      }
      let keys = item.keys || [];
      if (!Array.isArray(keys)) keys = [keys];
      this.items.push(merge(item, {
        value: toInternalValue(value),
        shortcuts: keys.map(createShortcut),
      }));
    });
  }

  registerShortcuts() {
    this.items.forEach(item => item.shortcuts.forEach(shortcut => {
      registerShortcut(shortcut, ev => {
        this.props.onChange(ev, item.value);
        this.onClickItem(ev, item.value);
      });
    }));
  }

  unregisterShortcuts() {
    this.items.forEach(item => item.shortcuts.forEach(unregisterShortcut));
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  titleBase: flexContainer('row', inputReset({
    display: 'inline-flex',
    padding: '1px 2px',
    minWidth: 40,
    cursor: 'pointer',
  })),
  title: ({ disabled, fFocused }) => {
    let out = style.titleBase;
    if (disabled) out = merge(out, INPUT_DISABLED);
    if (fFocused) out = merge(out, GLOW);
    return out;
  },
  caret: {
    marginLeft: 15,
    marginRight: 3,
    marginTop: 1,
  },
};

// ==========================================
// Public API
// ==========================================
const SelectCustom = input(SelectCustomBase, {
  toInternalValue, toExternalValue, isNull,
  fIncludeFocusCapture: true,
  trappedKeys: [
    KEYS.esc,
    // For ListPicker
    KEYS.down, KEYS.up,
    KEYS.home, KEYS.end,
    KEYS.return, KEYS.del, KEYS.backspace,
  ],
  className: 'giu-select-custom',
});

export {
  SelectCustom,
  LIST_SEPARATOR,
};
