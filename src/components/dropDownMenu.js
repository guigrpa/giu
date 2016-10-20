import React                from 'react';
import { omit, merge }      from 'timm';
import { COLORS }           from '../gral/constants';
import { bindAll }          from '../gral/helpers';
import { isDark }           from '../gral/styles';
import hoverable            from '../hocs/hoverable';
import Select               from '../inputs/select';

// ==========================================
// Component
// ==========================================
// -- Props:
// --
// -- * **items** *array(object)*: menu items, similar to [Select](#select)
// --   but with the inclusion of an `onClick` callback:
// --   - **value** *any*: any value that can be converted to JSON. Values should be unique
// --   - **label** *string*: descriptive string that will be shown to the user
// --   - **keys** *array(string)?*: keyboard shortcuts for this option, e.g.
// --     `mod+a` (= `cmd+a` in OS X, `ctrl+a` in Windows), `alt+backspace`, `shift+up`...
// --   - **onClick** *function?*: called when the item is clicked with the event as argument
// -- * **lang** *string?*: current language (NB: just used to make sure the component is refreshed)
// -- * **children** *any*: React elements that will be shown as the menu's title
// -- * **onClickItem** *function?*: called when an item is clicked
// --   with the following arguments:
// --   - **ev** *object*: `click` event
// --   - **value** *any*: the item's `value` (as specified in the `items` prop)
// -- * **style** *object?*: will be merged with the menu title's `div` wrapper
// -- * **accentColor** *string?*: CSS color descriptor (e.g. `darkgray`, `#ccffaa`...)
// -- * *All other props are passed through to the Select input component*
class DropDownMenu extends React.PureComponent {
  static propTypes = {
    items:                  React.PropTypes.array.isRequired,
    lang:                   React.PropTypes.string,
    children:               React.PropTypes.any.isRequired,
    onClickItem:            React.PropTypes.func,
    style:                  React.PropTypes.object,
    accentColor:            React.PropTypes.string,
    // Hoverable HOC
    hovering:               React.PropTypes.any,
    onHoverStart:           React.PropTypes.func.isRequired,
    onHoverStop:            React.PropTypes.func.isRequired,
    // all others are passed through unchanged
  };
  static defaultProps = {
    accentColor:            COLORS.accent,
  };

  constructor(props) {
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
    const props = omit(this.props, PROP_KEYS);
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
  onClickItem(ev, value) {
    const { items, onClickItem } = this.props;
    items.forEach(item => {
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
// Miscellaneous
// ==========================================
const PROP_KEYS = Object.keys(DropDownMenu.propTypes);

// ==========================================
// Public API
// ==========================================
export default hoverable(DropDownMenu);
