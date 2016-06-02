import React                from 'react';
import {
  merge,
  set as timmSet,
}                           from 'timm';
import {
  bindAll,
  preventDefault,
}                           from '../gral/helpers';
import { NULL_STRING }      from '../gral/constants';
import { LIST_SEPARATOR_KEY } from '../inputs/listPicker';
import { GLOW }             from '../gral/styles';
import input                from '../hocs/input';

function toInternalValue(val) { return val != null ? JSON.stringify(val) : NULL_STRING; }
function toExternalValue(val) { return val !== NULL_STRING ? JSON.parse(val) : null; }
function isNull(val) { return val === NULL_STRING; }

let cntId = 0;

// ==========================================
// Component
// ==========================================
// -- Props:
// --
// -- * **items** *array(object)*: each item has the following attributes
// --   - **value** *any*: any value that can be converted to JSON. Values should be unique
// --   - **label** *any?*: React elements that will be shown as a label for
// --     the corresponding radio button
// --   - **labelExtra** *any?*: React elements that will be shown below the main label
class RadioGroup extends React.Component {
  static propTypes = {
    disabled:               React.PropTypes.bool,
    items:                  React.PropTypes.array.isRequired,
    // Input HOC
    curValue:               React.PropTypes.string.isRequired,
    onChange:               React.PropTypes.func.isRequired,
    registerOuterRef:       React.PropTypes.func.isRequired,
    fFocused:               React.PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);
    this.buttonGroupName = `giu-radio-group_${cntId++}`;
    bindAll(this, [
      'renderItem',
      'onClickItem',
    ]);
  }

  componentWillMount() { this.prepareItems(this.props.items); }
  componentWillReceiveProps(nextProps) {
    const { items } = nextProps;
    if (items !== this.props.items) this.prepareItems(items);
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { registerOuterRef } = this.props;
    return (
      <div ref={registerOuterRef}
        style={style.outer(this.props)}
      >
        {this.items.map(this.renderItem)}
      </div>
    );
  }

  renderItem(item, idx) {
    const { curValue } = this.props;
    const { value, label, labelExtra } = item;
    const id = `${this.buttonGroupName}_${idx}`;
    return (
      <div key={value}
        id={idx}
        onClick={this.onClickItem}
      >
        <input
          type="radio"
          name={this.buttonGroupName}
          id={id}
          value={value}
          checked={curValue === value}
          onMouseDown={preventDefault}
          readOnly /* will change via parent's onClick */
          tabIndex={-1}
        />
        <label htmlFor={id}>{label}</label>
        {
          labelExtra &&
          <div style={style.labelExtra}>{labelExtra}</div>
        }
      </div>
    );
  }

  // ==========================================
  // Event handlers
  // ==========================================
  onClickItem(ev) {
    const idx = Number(ev.currentTarget.id);
    const item = this.items[idx];
    if (!item) return;
    this.props.onChange(ev, item.value);
  }

  // ==========================================
  // Helpers
  // ==========================================
  prepareItems(rawItems) {
    this.items = [];
    rawItems.forEach(item => {
      if (item.label === LIST_SEPARATOR_KEY) return;
      this.items.push(timmSet(item, 'value', toInternalValue(item.value)));
    });
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  outerBase: {
    border: '1px solid transparent',
  },
  outer: ({ disabled, fFocused }) => {
    let out = style.outerBase;
    if (disabled) {
      out = merge(out, {
        cursor: 'default',
        pointerEvents: 'none',
      });
    }
    if (fFocused) out = merge(out, GLOW);
    return out;
  },
  labelExtra: {
    marginLeft: 20,
    cursor: 'default',
  },
};

// ==========================================
// Public API
// ==========================================
export default input(RadioGroup, {
  toInternalValue, toExternalValue, isNull,
  fIncludeFocusCapture: true,
  className: 'giu-radio-buttons',
});
