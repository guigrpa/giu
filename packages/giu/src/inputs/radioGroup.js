// @flow

import React from 'react';
import { set as timmSet } from 'timm';
import classnames from 'classnames';
import { preventDefault, memoize } from '../gral/helpers';
import { NULL_STRING, IS_IOS } from '../gral/constants';
import { LIST_SEPARATOR_KEY } from './listPicker';
import Input from '../hocs/input';
import type { InputHocPublicProps } from '../hocs/input';

const toInternalValue = (val) =>
  val != null ? JSON.stringify(val) : NULL_STRING;
const toExternalValue = (val) => {
  if (val === NULL_STRING) return null;
  try {
    return JSON.parse(val);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('RadioGroup: error parsing JSON', val);
    return null;
  }
};
const isNull = (val) => val === NULL_STRING;

// ==========================================
// Declarations
// ==========================================
// -- Props:
// -- START_DOCS
type PublicProps = {
  ...$Exact<InputHocPublicProps>, // common to all inputs (check the docs!)
  className?: string,
  id: string, // mandatory!
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
class BaseRadioGroup extends React.Component<Props> {
  items: Array<RadioChoice>;

  // ==========================================
  render() {
    this.items = this.prepareItems(this.props.items);
    const { registerOuterRef } = this.props;
    return (
      <div
        ref={registerOuterRef}
        className={classnames(
          'giu-radio-group',
          {
            'giu-glow': this.props.fFocused,
            'giu-radio-group-disabled': this.props.disabled,
          },
          this.props.className
        )}
        id={this.props.id}
      >
        {this.items.map(this.renderItem)}
      </div>
    );
  }

  renderItem = (item, idx) => {
    const { id, curValue } = this.props;
    const { value, label, labelExtra } = item;
    const radioGroupName = `giu-radio-group-${id}`;
    const itemId = `${id}_${idx}`;
    const finalLabel =
      label && typeof label === 'function' ? label(this.props.lang) : label;
    return (
      <div key={value} onClick={this.onClickItem(idx)}>
        <input
          type="radio"
          name={radioGroupName}
          id={itemId}
          value={value}
          checked={curValue === value}
          onMouseDown={preventDefault}
          readOnly /* will change via parents onClick */
          tabIndex={-1}
        />
        <label htmlFor={radioGroupName}>{finalLabel}</label>
        {labelExtra && (
          <div className="giu-radio-group-label-extra">{labelExtra}</div>
        )}
      </div>
    );
  };

  // ==========================================
  onClickItem = (idx) => (ev) => {
    const item = this.items[idx];
    if (!item) return;
    this.props.onChange(ev, item.value);
  };

  // ==========================================
  prepareItems = memoize((rawItems) => {
    const items = [];
    for (let i = 0; i < rawItems.length; i++) {
      const rawItem = rawItems[i];
      if (rawItem.label === LIST_SEPARATOR_KEY) continue;
      items.push(timmSet(rawItem, 'value', toInternalValue(rawItem.value)));
    }
    return items;
  });
}

// ==========================================
const hocOptions = {
  componentName: 'RadioGroup',
  toInternalValue,
  toExternalValue,
  isNull,
  fIncludeFocusCapture: !IS_IOS,
  className: 'giu-radio-group-wrapper',
};
const render = (props) => <BaseRadioGroup {...props} />;
// $FlowFixMe
const RadioGroup = React.forwardRef((publicProps: PublicProps, ref) => (
  <Input hocOptions={hocOptions} render={render} {...publicProps} ref={ref} />
));

// ==========================================
// Public
// ==========================================
export default RadioGroup;
