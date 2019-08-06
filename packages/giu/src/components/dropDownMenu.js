// @flow

import React from 'react';
import { omit } from 'timm';
import classnames from 'classnames';
import type { Choice } from '../gral/types';
import Select from '../inputs/select';

// ==========================================
// Component
// ==========================================
// -- Props:
// --
/* -- START_DOCS -- */
type Props = {
  // Items: similar to the Select component but including an `onClick` callback
  items: Array<Choice>,

  // Other props
  lang?: string, // current language (used just for force-render)
  children?: any, // React elements that will be shown as the menu's title
  onClickItem?: (
    ev: SyntheticMouseEvent<*>, // `click` event
    val: any // the item's `value` (as specified in the `items` prop)
  ) => any,

  // All other props are passed through to the Select input component
};
/* -- END_DOCS -- */

const FILTERED_PROPS = [
  'items',
  'lang',
  'children',
  'onClickItem',
  'accentColor',
];

type State = {
  fFocused: boolean,
};

class DropDownMenu extends React.PureComponent<Props, State> {
  refSelect: any = React.createRef();

  state = { fFocused: false };

  // ==========================================
  render() {
    const props = omit(this.props, FILTERED_PROPS);
    return (
      <Select
        ref={this.refSelect}
        type="dropDownPicker"
        items={this.props.items}
        lang={this.props.lang}
        onClickItem={this.onClickItem}
        onCloseFloat={this.closeMenu}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        {...props}
        required
        noErrors
      >
        {this.renderTitle()}
      </Select>
    );
  }

  renderTitle() {
    return (
      <div
        className={classnames('giu-drop-down-menu-title', {
          'giu-drop-down-menu-title-selected': this.state.fFocused,
        })}
        onMouseDown={this.onMouseDownTitle}
      >
        {this.props.children}
      </div>
    );
  }

  // ==========================================
  // If the menu is not focused, ignore it: it will be handled by the `input` HOC.
  // ...but if it is focused, we want it to close
  onMouseDownTitle = () => {
    if (!this.state.fFocused) return;
    this.closeMenu();
  };

  // Run the `onClick` function (if any) associated to the clicked item,
  // and run the `onClickItem` prop.
  onClickItem = (ev: SyntheticMouseEvent<*>, value: any) => {
    const { items, onClickItem } = this.props;
    items.forEach(item => {
      if (item.value === value && item.onClick) item.onClick(ev);
    });
    onClickItem && onClickItem(ev, value);
    this.closeMenu();
  };

  onFocus = () => {
    this.setState({ fFocused: true });
  };

  // On blur, remove the stored value from the select
  onBlur = () => {
    this.setState({ fFocused: false }, () => {
      const target = this.refSelect.current;
      if (target && target.revert) target.revert();
    });
  };

  // ==========================================
  closeMenu = () => {
    setImmediate(() => {
      const target = this.refSelect.current;
      if (target && target.blur) target.blur();
    });
  };
}

// ==========================================
// Public
// ==========================================
export default DropDownMenu;
