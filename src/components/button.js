import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { omit, merge }      from 'timm';
import { COLORS }           from '../gral/constants';

// ==========================================
// Component
// ==========================================
class Button extends React.Component {
  static propTypes = {
    plain:                  React.PropTypes.bool,
    children:               React.PropTypes.any,
    onClick:                React.PropTypes.func,
    disabled:               React.PropTypes.bool,
    style:                  React.PropTypes.object,
    // all other props are passed through
  };
  static defaultProps = {
    plain:                  false,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
  }

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
