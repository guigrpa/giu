import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { COLORS, KEYS }     from '../gral/constants';
import {
  bindAll,
  cancelEvent,
}                           from '../gral/helpers';
import { isDark }           from '../gral/styles';
import hoverable            from '../hocs/hoverable';
import {
  floatAdd,
  floatDelete,
  floatUpdate,
  warnFloats,
}                           from '../components/floats';
import FocusCapture         from '../components/focusCapture';
import { ListPicker }        from '../inputs/listPicker';

// ==========================================
// Component
// ==========================================
class DropDownMenu extends React.Component {
  static propTypes = {
    children:               React.PropTypes.any.isRequired,
    items:                  React.PropTypes.array.isRequired,
    floatPosition:          React.PropTypes.string,
    floatAlign:             React.PropTypes.string,
    floatZ:                 React.PropTypes.number,
    accentColor:            React.PropTypes.string,
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
    this.state = { fOpen: false };
    this.cmdsToPicker = null;
    bindAll(this, [
      'registerFocusCaptureRef',
      'registerTitleRef',
      'onMouseDownTitle',
      'onFocus',
      'onBlur',
      'onKeyDown',
      'onClickItem',
    ]);
  }

  componentDidMount() { warnFloats(this.constructor.name); }
  componentDidUpdate() { this.renderFloat(); }
  componentWillUnmount() { floatDelete(this.floatId); }

  // ==========================================
  // Render
  // ==========================================
  render() {
    return (
      <div
        className="giu-drop-down-menu"
        onMouseDown={this.onMouseDownTitle}
        style={style.outer}
      >
        {this.renderFocusCapture()}
        {this.renderTitle()}
      </div>
    );
  }

  renderFocusCapture() {
    return (
      <FocusCapture
        registerRef={this.registerFocusCaptureRef}
        onFocus={this.onFocus}
        onBlur={this.onBlur}
        onKeyDown={this.onKeyDown}
      />
    );
  }

  renderTitle() {
    const { children, accentColor } = this.props;
    const styleProps = {
      fOpen: this.state.fOpen,
      accentColor,
    };
    return (
      <div ref={this.registerTitleRef}
        style={style.title(styleProps)}
      >
        {children}
      </div>
    );
  }

  renderFloat() {
    const { fOpen } = this.state;

    // Remove float
    if (!fOpen && this.floatId != null) {
      floatDelete(this.floatId);
      this.floatId = null;
      return;
    }

    // Create or update float
    if (fOpen) {
      const { floatZ, floatPosition, floatAlign } = this.props;
      const floatOptions = {
        position: floatPosition,
        align: floatAlign,
        zIndex: floatZ,
        limitSize: true,
        getAnchorNode: () => this.refTitle,
        children: this.renderMenu(),
      };
      if (this.floatId == null) {
        this.floatId = floatAdd(floatOptions);
      } else {
        floatUpdate(this.floatId, floatOptions);
      }
    }
  }

  renderMenu() {
    const { items, accentColor } = this.props;
    return (
      <ListPicker
        items={items}
        onClickItem={this.onClickItem}
        focusable={false}
        cmds={this.cmdsToPicker}
        accentColor={accentColor}
      />
    );
  }

  // ==========================================
  // Handlers
  // ==========================================
  registerFocusCaptureRef(c) { this.refFocusCapture = c; }
  registerTitleRef(c) { this.refTitle = c; }

  onFocus() { this.setState({ fOpen: true }); }
  onBlur() { this.setState({ fOpen: false }); }

  onMouseDownTitle(ev) {
    cancelEvent(ev);
    const op = this.state.fOpen ? 'blur' : 'focus';
    this.refFocusCapture[op]();
  }

  onKeyDown(ev) {
    switch (ev.which) {
      case KEYS.esc:
        cancelEvent(ev);
        ev.target.blur();
        break;
      default:
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
        break;
    }
  }

  onClickItem(ev, value) {
    const { items, onClickItem } = this.props;
    for (const item of items) {
      if (item.value === value) {
        if (item.onClick) item.onClick(ev);
        break;
      }
    }
    if (onClickItem) onClickItem(ev, value);
    this.refFocusCapture.blur();
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  outer: {
    display: 'inline-block',
  },
  title: ({ fOpen, accentColor }) => {
    const backgroundColor = fOpen ? accentColor : undefined;
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
// Public API
// ==========================================
export default hoverable(DropDownMenu);
