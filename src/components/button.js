import React                from 'react';
import { omit, merge }      from 'timm';
import { COLORS }           from '../gral/constants';

// ==========================================
// Component
// ==========================================
// -- An inconspicuous-looking button-in-a-`span`. Props:
// --
// -- * **plain** *boolean?*: removes most button styles
// -- * **children** *any*: button contents (can include `Icon`
// --   components, etc.)
// -- * **onClick** *function?*: `click` handler
// -- * **disabled** *boolean?*
// -- * **style** *object?*: merged with the `span` style
// -- * *All other props are passed through to the `span` element*
class Button extends React.PureComponent {
  static propTypes = {
    plain:                  React.PropTypes.bool,
    children:               React.PropTypes.any,
    onClick:                React.PropTypes.func,
    disabled:               React.PropTypes.bool,
    style:                  React.PropTypes.object,
    // all other props are passed through
  };

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { children, disabled, onClick } = this.props;
    const otherProps = omit(this.props, PROP_KEYS);
    return (
      <span
        className="giu-button"
        onClick={!disabled && onClick}
        {...otherProps}
        style={style.button(this.props)}
      >
        {children}
      </span>
    );
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  plainBase: {
    cursor: 'pointer',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  buttonBase: {
    display: 'inline-block',
    cursor: 'pointer',
    border: `1px solid ${COLORS.line}`,
    borderRadius: 5,
    padding: '1px 5px',
    userSelect: 'none',
    WebkitUserSelect: 'none',
  },
  button: ({ plain, disabled, style: baseStyle }) => {
    let out = plain ? style.plainBase : style.buttonBase;
    if (disabled) {
      out = merge(out, {
        color: COLORS.dim,
        cursor: 'default',
        pointerEvents: 'none',
      });
    }
    out = merge(out, baseStyle);
    return out;
  },
};

// ==========================================
// Miscellaneous
// ==========================================
const PROP_KEYS = Object.keys(Button.propTypes);

// ==========================================
// Public API
// ==========================================
export default Button;
