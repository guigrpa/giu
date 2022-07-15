// @flow

import React from 'react';
import classnames from 'classnames';
import type { FloatPosition, FloatAlign } from './floats';
import type { Choice } from '../gral/types';
import Select from '../inputs/select';

// ==========================================
// Component
// ==========================================
// -- Props:
// --
/* -- START_DOCS -- */
type Props = {
  className?: string,
  id?: string,

  // Items: similar to the Select component but including an `onClick` callback
  items: Array<Choice>,

  // Other props
  lang?: string, // current language (used just for force-render)
  children?: any, // React elements that will be shown as the menu's title
  onClickItem?: (
    ev: SyntheticMouseEvent<*>, // `click` event
    val: any // the item's `value` (as specified in the `items` prop)
  ) => any,
  floatPosition?: FloatPosition,
  floatAlign?: FloatAlign,
};
/* -- END_DOCS -- */

type State = {
  fFocused: boolean,
};

class DropDownMenu extends React.PureComponent<Props, State> {
  refSelect: any = React.createRef();

  state = { fFocused: false };

  // ==========================================
  render() {
    const { className, id } = this.props;
    return (
      <span
        className={classnames('giu-drop-down-menu', className)}
        id={this.props.id}
      >
        <Select
          ref={this.refSelect}
          className={className}
          id={id ? `${id}-drop-down-menu` : undefined}
          type="dropDownPicker"
          items={this.props.items}
          lang={this.props.lang}
          onClickItem={this.onClickItem}
          onCloseFloat={this.closeMenu}
          floatPosition={this.props.floatPosition}
          floatAlign={this.props.floatAlign}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          required
          noErrors
        >
          {this.renderTitle()}
        </Select>
      </span>
    );
  }

  renderTitle() {
    return (
      <span
        className={classnames('giu-drop-down-menu-title', {
          'giu-drop-down-menu-title-selected': this.state.fFocused,
        })}
        onMouseDown={this.onMouseDownTitle}
      >
        {this.props.children}
      </span>
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
    items.forEach((item) => {
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
