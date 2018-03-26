// @noflow

import React from 'react';
import { merge, set as timmSet } from 'timm';
import { preventDefault } from '../gral/helpers';
import { NULL_STRING, IS_IOS } from '../gral/constants';
import { LIST_SEPARATOR_KEY } from '../inputs/listPicker';
import { GLOW } from '../gral/styles';
import input from '../hocs/input';

const toInternalValue = val =>
  val != null ? JSON.stringify(val) : NULL_STRING;
const toExternalValue = val => {
  if (val === NULL_STRING) return null;
  try {
    return JSON.parse(val);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('RadioGroup: error parsing JSON', val);
    return null;
  }
};
const isNull = val => val === NULL_STRING;

let cntId = 0;

// ==========================================
// Declarations
// ==========================================
// -- Props:
// -- START_DOCS
type PublicProps = {
  items: Array<RadioChoice>,
  lang?: string, // current language (used just for force-render)
  disabled?: boolean,
};

type RadioChoice = {
  value: any, // any value that can be converted to JSON. Values should be unique
  // React elements that will be shown as a label for the corresponding radio button
  label?: any | ((lang: ?string) => any),
  labelExtra?: any, // React elements that will be shown below the main label
};
// -- END_DOCS

type Props = {
  ...$Exact<PublicProps>,
  // Input HOC
  curValue: string,
  onChange: Function,
  registerOuterRef: Function,
  fFocused: boolean,
};

// ==========================================
// Component
// ==========================================
class RadioGroup extends React.Component {
  static defaultProps = {};
  props: Props;
  items: Array<RadioChoice>;
  buttonGroupName: string;

  constructor() {
    super();
    this.buttonGroupName = `giu-radio-group_${cntId}`;
    cntId += 1;
  }

  componentWillMount() {
    this.prepareItems(this.props.items);
  }
  componentWillReceiveProps(nextProps: Props) {
    const { items } = nextProps;
    if (items !== this.props.items) this.prepareItems(items);
  }

  // ==========================================
  render() {
    const { registerOuterRef } = this.props;
    return (
      <div ref={registerOuterRef} style={style.outer(this.props)}>
        {this.items.map(this.renderItem)}
      </div>
    );
  }

  renderItem = (item, idx) => {
    const { curValue } = this.props;
    const { value, label, labelExtra } = item;
    const id = `${this.buttonGroupName}_${idx}`;
    const finalLabel =
      label && typeof label === 'function' ? label(this.props.lang) : label;
    return (
      <div key={value} id={idx} onClick={this.onClickItem}>
        <input
          type="radio"
          name={this.buttonGroupName}
          id={id}
          value={value}
          checked={curValue === value}
          onMouseDown={preventDefault}
          readOnly /* will change via parents onClick */
          tabIndex={-1}
        />
        <label htmlFor={id}>{finalLabel}</label>
        {labelExtra && <div style={style.labelExtra}>{labelExtra}</div>}
      </div>
    );
  };

  // ==========================================
  onClickItem = ev => {
    const idx = Number(ev.currentTarget.id);
    const item = this.items[idx];
    if (!item) return;
    this.props.onChange(ev, item.value);
  };

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
// Public
// ==========================================
export default input(RadioGroup, {
  toInternalValue,
  toExternalValue,
  isNull,
  fIncludeFocusCapture: !IS_IOS,
  className: 'giu-radio-buttons',
});
