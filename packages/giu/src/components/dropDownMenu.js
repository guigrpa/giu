// @flow

import React from 'react';
import { omit, merge } from 'timm';
import type { Choice, Command } from '../gral/types';
import { COLORS } from '../gral/constants';
import { isDark } from '../gral/styles';
import { ThemeContext } from '../gral/themeContext';
import type { Theme } from '../gral/themeContext';
import Select from '../inputs/select';

// ==========================================
// Component
// ==========================================
// -- Props:
// --
/* -- START_DOCS -- */
type PublicProps = {
  // Items: similar to the Select component but including an `onClick` callback
  items: Array<Choice>,

  // Other props
  lang?: string, // current language (used just for force-render)
  children?: any, // React elements that will be shown as the menu's title
  onClickItem?: (
    ev: SyntheticMouseEvent<*>, // `click` event
    val: any // the item's `value` (as specified in the `items` prop)
  ) => any,
  style?: Object, // will be merged with the menu title's `div` wrapper

  // All other props are passed through to the Select input component
};
/* -- END_DOCS -- */

type Props = {
  ...$Exact<PublicProps>,
  // Context
  theme: Theme,
};

const FILTERED_PROPS = [
  'items',
  'lang',
  'children',
  'onClickItem',
  'style',
  'accentColor',
];

type State = {
  fFocused: boolean,
  cmds: ?Array<Command>,
};

class DropDownMenu extends React.PureComponent<Props, State> {
  state = {
    fFocused: false,
    cmds: null,
  };

  // ==========================================
  render() {
    const props = omit(this.props, FILTERED_PROPS);
    return (
      <Select
        type="dropDownPicker"
        items={this.props.items}
        lang={this.props.lang}
        cmds={this.state.cmds}
        onClickItem={this.onClickItem}
        onCloseFloat={this.closeMenu}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        styleOuter={style.selectOuter}
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
        className="giu-drop-down-menu-title"
        onMouseDown={this.onMouseDownTitle}
        style={style.title(this.props, this.state)}
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
    this.setState({
      fFocused: false,
      cmds: [{ type: 'REVERT' }],
    });
  };

  // ==========================================
  closeMenu = () => {
    this.setState({ cmds: [{ type: 'BLUR' }, { type: 'REVERT' }] });
  };
}

// ==========================================
const ThemedDropDownMenu = (props: PublicProps) => (
  <ThemeContext.Consumer>
    {theme => <DropDownMenu {...props} theme={theme} />}
  </ThemeContext.Consumer>
);

// ==========================================
const style = {
  selectOuter: {
    display: 'inline-block',
  },
  title: ({ theme, style: baseStyle }, { fFocused }) => {
    const backgroundColor = fFocused ? theme.accentColor : undefined;
    let color;
    if (backgroundColor != null) {
      color = COLORS[isDark(backgroundColor) ? 'lightText' : 'darkText'];
    }
    const out = {
      display: 'inline-block',
      cursor: 'pointer',
      backgroundColor,
      color,
    };
    return merge(out, baseStyle);
  },
};

// ==========================================
// Public
// ==========================================
export default ThemedDropDownMenu;
