// @flow

import React                from 'react';
import { omit, merge }      from 'timm';
import type {
  Choice,
  Command,
}                           from '../gral/types';
import { COLORS }           from '../gral/constants';
import { bindAll }          from '../gral/helpers';
import { isDark }           from '../gral/styles';
import hoverable            from '../hocs/hoverable';
import type { HoverableProps } from '../hocs/hoverable';
import Select               from '../inputs/select';

// ==========================================
// Component
// ==========================================
// -- Props:
// --
// -- * **items** *Array<Choice>*: menu items, similar to [Select](#select)
// --   but with the inclusion of an `onClick` callback:
// --   - **value** *any*: any value that can be converted to JSON. Values should be unique
// --   - **label?** *string*: descriptive string that will be shown to the user
// --   - **keys?** *Array<string>*: keyboard shortcuts for this option, e.g.
// --     `mod+a` (= `cmd+a` in OS X, `ctrl+a` in Windows), `alt+backspace`, `shift+up`...
// --   - **onClick?** *(ev: SyntheticEvent) => void*: called when the item is clicked
// --     with the event as argument
// -- * **lang?** *string*: current language (NB: just used to make sure the component is refreshed)
// -- * **children** *any*: React elements that will be shown as the menu's title
// -- * **onClickItem?** *Function*: called when an item is clicked
// --   with the following arguments:
// --   - **ev** *SyntheticMouseEvent*: `click` event
// --   - **value** *any*: the item's `value` (as specified in the `items` prop)
// -- * **style?** *Object*: will be merged with the menu title's `div` wrapper
// -- * **accentColor?** *string*: CSS color descriptor (e.g. `darkgray`, `#ccffaa`...)
// -- * *All other props are passed through to the Select input component*

type PublicProps = {
  items: Array<Choice>,
  lang?: string,
  children: any,
  onClickItem?: (ev: SyntheticMouseEvent, val: any) => void,
  style?: Object,
  accentColor: string,
  // all others are passed through unchanged
};
type Props = PublicProps & HoverableProps;
const FILTERED_PROPS = [
  'items', 'lang', 'children', 'onClickItem', 'style', 'accentColor',
];

class DropDownMenu extends React.PureComponent {
  props: Props;
  state: {
    fFocused: boolean,
    cmds: ?Array<Command>,
  };

  static defaultProps = {
    accentColor:            COLORS.accent,
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      fFocused: false,
      cmds: null,
    };
    bindAll(this, [
      'onMouseDownTitle',
      'onClickItem',
      'onFocus',
      'onBlur',
      'closeMenu',
    ]);
  }

  // ==========================================
  // Render
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
        accentColor={this.props.accentColor}
        {...props}
        required noErrors
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
  // Handlers
  // ==========================================
  // If the menu is not focused, ignore it: it will be handled by the `input` HOC.
  // ...but if it is focused, we want it to close
  onMouseDownTitle() {
    if (!this.state.fFocused) return;
    this.closeMenu();
  }

  // Run the `onClick` function (if any) associated to the clicked item,
  // and run the `onClickItem` prop.
  onClickItem(ev: SyntheticMouseEvent, value: any) {
    const { items, onClickItem } = this.props;
    items.forEach((item) => {
      if (item.value === value && item.onClick) item.onClick(ev);
    });
    onClickItem && onClickItem(ev, value);
    this.closeMenu();
  }

  onFocus() { this.setState({ fFocused: true }); }

  // On blur, remove the stored value from the select
  onBlur() {
    this.setState({
      fFocused: false,
      cmds: [{ type: 'REVERT' }],
    });
  }

  // ==========================================
  // Helpers
  // ==========================================
  closeMenu() {
    this.setState({ cmds: [{ type: 'BLUR' }, { type: 'REVERT' }] });
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  selectOuter: {
    display: 'inline-block',
  },
  title: ({ accentColor, style: baseStyle }, { fFocused }) => {
    const backgroundColor = fFocused ? accentColor : undefined;
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
// Public API
// ==========================================
export default hoverable(DropDownMenu);
