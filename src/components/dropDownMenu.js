import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { omit }             from 'timm';
import { COLORS }           from '../gral/constants';
import { bindAll }          from '../gral/helpers';
import { isDark }           from '../gral/styles';
import hoverable            from '../hocs/hoverable';
import Select               from '../inputs/select';

// ==========================================
// Component
// ==========================================
class DropDownMenu extends React.Component {
  static propTypes = {
    onClickItem:            React.PropTypes.func,
    // Hoverable HOC
    hovering:               React.PropTypes.any,
    onHoverStart:           React.PropTypes.func.isRequired,
    onHoverStop:            React.PropTypes.func.isRequired,
  }
  static defaultProps = {
    accentColor:            COLORS.accent,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
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
        cmds={this.state.cmds}
        onClickItem={this.onClickItem}
        onCloseFloat={this.closeMenu}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        styleOuter={style.selectOuter}
        {...props}
      >
        {this.renderTitle()}
      </Select>
    );
  }

  renderTitle() {
    const { children, accentColor } = this.props;
    const { fFocused } = this.state;
    const styleProps = { fFocused, accentColor };
    return (
      <div
        onMouseDown={this.onMouseDownTitle}
        style={style.title(styleProps)}
      >
        {children}
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
  title: ({ fFocused, accentColor }) => {
    const backgroundColor = fFocused ? accentColor : undefined;
    let color;
    if (backgroundColor != null) {
      color = COLORS[isDark(backgroundColor) ? 'lightText' : 'darkText'];
    }
    return {
      display: 'inline-block',
      cursor: 'pointer',
      backgroundColor,
      color,
    };
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
