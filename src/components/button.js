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
    const { plain, children } = this.props;
    const otherProps = omit(this.props, PROP_KEYS);
    return plain
      ? this.renderPlain(otherProps, children)
      : this.renderButton(otherProps, children);
  }

  renderPlain(otherProps, children) {
    return (
      <span
        className="giu-button"
        {...otherProps}
        style={merge(style.plain, this.props.style)}
      >
        {children}
      </span>
    );
  }

  renderButton(otherProps, children) {
    return (
      <span
        className="giu-button"
        {...otherProps}
        style={merge(style.button, this.props.style)}
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
  plain: {
    cursor: 'pointer',
  },
  button: {
    display: 'inline-block',
    cursor: 'pointer',
    border: `1px solid ${COLORS.line}`,
    borderRadius: 5,
    padding: '1px 5px',
    userSelect: 'none',
    WebkitUserSelect: 'none',
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
