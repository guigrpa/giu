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
  warnFloats,
}                           from '../components/floats';
import FocusCapture         from '../components/focusCapture';

// ==========================================
// Component
// ==========================================
class DropDownMenu extends React.Component {
  static propTypes = {
    children:               React.PropTypes.any,
    floatPosition:          React.PropTypes.string,
    floatAlign:             React.PropTypes.string,
    floatZ:                 React.PropTypes.number,
    accentColor:            React.PropTypes.string,
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
    bindAll(this, [
      'registerFocusCaptureRef',
      'registerTitleRef',
      'onMouseDownTitle',
      'onFocus',
      'onBlur',
      'onKeyDown',
    ]);
  }

  componentDidMount() { warnFloats(this.constructor.name); }
  componentWillUnmount() { this.unmountFloat(); }

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
    }
    return (
      <div ref={this.registerTitleRef}
        style={style.title(styleProps)}
      >
        {children}
      </div>
    );
  }

  renderFloat() {
    return (
      <div
        className="giu-drop-down-menu-float"
        onMouseDown={cancelEvent}
        style={style.float}
      >
        Menu option menu option<br />
        Menu option menu option<br />
        Menu option menu option<br />
        Menu option menu option
      </div>
    );
  }

  // ==========================================
  // Handlers
  // ==========================================
  registerFocusCaptureRef(c) { this.refFocusCapture = c; }
  registerTitleRef(c) { this.refTitle = c; }

  onFocus(ev) {
    this.setState({ fOpen: true });
    this.mountFloat();
  }

  onBlur(ev) {
    this.setState({ fOpen: false });
    this.unmountFloat();
  }

  onMouseDownTitle(ev) {
    cancelEvent(ev);
    const op = this.state.fOpen ? 'blur' : 'focus';
    this.refFocusCapture[op]();
  }

  onKeyDown(ev) {
    switch (ev.which) {
      // case KEYS.down:   this.selectMoveBy(ev, +1); break;
      // case KEYS.up:     this.selectMoveBy(ev, -1); break;
      // case KEYS.home:   this.selectMoveTo(ev, 0); break;
      // case KEYS.end:    this.selectMoveTo(ev, this.props.items.length - 1); break;
      case KEYS.esc:
        cancelEvent(ev);
        ev.target.blur();
        break;
      default:
        if (this.props.onKeyDown) this.props.onKeyDown(ev);
        break;
    }
  }

  mountFloat() {
    if (this.floatId != null) return;
    const { floatPosition, floatAlign, floatZ } = this.props;
    this.floatId = floatAdd({
      position: floatPosition,
      align: floatAlign,
      zIndex: floatZ,
      getAnchorNode: () => this.refTitle,
      children: this.renderFloat(),
    });
  }

  unmountFloat() {
    if (this.floatId == null) return;
    floatDelete(this.floatId);
    this.floatId = null;
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
      marginLeft: 8,
      marginRight: 8,
      cursor: 'pointer',
      backgroundColor,
      color,
    };
  },
  float: {

  },
};


// ==========================================
// Public API
// ==========================================
export default hoverable(DropDownMenu);
