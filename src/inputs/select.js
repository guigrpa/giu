import React                from 'react';
import { omit }             from 'timm';
import {
  bindAll,
  cancelEvent,
}                           from '../gral/helpers';
import { COLORS, KEYS }     from '../gral/constants';
import input                from '../hocs/input';
import {
  ListPicker,
  LIST_SEPARATOR,
}                           from '../inputs/listPicker';

const NULL_VALUE = '__NULL__';
function toInternalValue(val) { return val != null ? JSON.stringify(val) : NULL_VALUE; }
function toExternalValue(val) { debugger; return val !== NULL_VALUE ? JSON.parse(val) : null; }

// ==========================================
// Component
// ==========================================
class Select extends React.Component {
  static propTypes = {
    items:                  React.PropTypes.array.isRequired,
    allowNull:              React.PropTypes.bool,
    type:                   React.PropTypes.oneOf([
      'native',
      'inlinePicker',
      'dropDownPicker',
    ]),
    twoStageStyle:          React.PropTypes.bool,
    accentColor:            React.PropTypes.string,
    // Input HOC
    curValue:               React.PropTypes.string.isRequired,
    errors:                 React.PropTypes.array.isRequired,
    registerOuterRef:       React.PropTypes.func.isRequired,
    registerFocusableRef:   React.PropTypes.func.isRequired,
    // all others are passed through unchanged
    // (in the `native` case)
  };
  static defaultProps = {
    type:                   'native',
    twoStageStyle:          false,
    accentColor:            COLORS.accent,
  };

  constructor(props) {
    super(props);
    this.state = { fFloat: false };
    this.cmdsToPicker = null;
    bindAll(this, [
      'registerInputRef',
      'onKeyDown',
      'onClick',
    ]);
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { type, items, allowNull } = this.props;
    this.items = [];
    if (allowNull) this.items.push({ value: NULL_VALUE, label: '' });
    if (type === 'native') {
      items.forEach(item => {
        if (item.label === LIST_SEPARATOR.label) return;
        this.items.push(item);
      });
    } else {
      this.items = this.items.concat(items);
    }
    let out;
    switch (type) {
      case 'native':         out = this.renderNative();         break;
      case 'inlinePicker':   out = this.renderInlinePicker();   break;
      case 'dropDownPicker': out = this.renderDropDownPicker(); break;
      default:               out = null;                        break;
    }
    return out;
  }

  renderNative() {
    const { curValue, registerFocusableRef } = this.props;
    const otherProps = omit(this.props, PROP_KEYS);
    return (
      <select ref={registerFocusableRef}
        className="giu-select"
        value={curValue}
        {...otherProps}
        style={style.native}
      >
        {this.items.map(o => {
          const value = o.value === NULL_VALUE ? o.value : toInternalValue(o.value);
          return <option key={value} id={value} value={value}>{o.label}</option>;
        })}
      </select>
    );
  }

  renderInlinePicker() {
    const {
      curValue, onChange,
      onFocus, onBlur, registerOuterRef,
      twoStageStyle, accentColor,
    } = this.props;
    return (
      <div ref={registerOuterRef}
        className="giu-select"
      >
        <input ref={this.registerInputRef}
          type="text"
          onFocus={onFocus}
          onBlur={onBlur}
          onKeyDown={this.onKeyDown}
          style={style.hiddenField}
        />
        <ListPicker
          items={this.items}
          value={toExternalValue(curValue)}
          disabled={this.props.disabled}
          focusable={false}
          cmds={this.cmdsToPicker}
          onChange={(ev, nextValue) => onChange(ev, toInternalValue(nextValue))}
          onClick={this.onClick}
          twoStageStyle={twoStageStyle}
          accentColor={accentColor}
        />
      </div>
    );
  }

  renderDropDownPicker() {}

  // ==========================================
  // Helpers
  // ==========================================
  registerInputRef(c) {
    this.refInput = c;
    this.props.registerFocusableRef(c);
  }

  onKeyDown(ev) {
    console.log(ev)
    const { which } = ev;
    if (which === KEYS.esc && this.props.type === 'dropDownPicker') {
      const { fFloat } = this.state;
      this.setState({ fFloat: !fFloat });
      return;
    }
    this.cmdsToPicker = [{
      type: 'KEY_DOWN',
      which: ev.which,
      keyCode: ev.keyCode,
      metaKey: ev.metaKey,
      shiftKey: ev.shiftKey,
      altKey: ev.altKey,
      ctrlKey: ev.ctrlKey,
    }];
    this.forceUpdate();
  }

  onClick(ev) {
    this.refInput.focus();
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  native: {
    fontFamily: 'inherit',
    fontSize: 'inherit',
    fontWeight: 'inherit',
  },
  outer: {
    position: 'relative',
  },
  hiddenField: {
    opacity: 1,
    position: 'fixed',
    zIndex: -50,
    pointerEvents: 'none',
  },
};

// ==========================================
// Miscellaneous
// ==========================================
const PROP_KEYS = Object.keys(Select.propTypes);

// ==========================================
// Public API
// ==========================================
export default input(Select, { toInternalValue, toExternalValue });
