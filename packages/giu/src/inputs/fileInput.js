import React                from 'react';
import { omit, merge }      from 'timm';
import filesize             from 'filesize';
import {
  GLOW,
  HIDDEN_FOCUS_CAPTURE,
}                           from '../gral/styles';
import input                from '../hocs/input';
import Button               from '../components/button';
import Icon                 from '../components/icon';

function isNull(val) { return val == null; }

// ==========================================
// Component
// ==========================================
// -- Props:
// --
// -- * **children** *any? = `Choose file…`*: React elements that
// --   will be shown inside the button
// -- * **style** *object?*: will be merged with the outermost `span` element
class FileInput extends React.Component {
  static propTypes = {
    children:               React.PropTypes.any,
    cmds:                   React.PropTypes.array,
    disabled:               React.PropTypes.bool,
    style:                  React.PropTypes.object,
    // Input HOC
    registerOuterRef:       React.PropTypes.func.isRequired,
    registerFocusableRef:   React.PropTypes.func.isRequired,
    curValue:               React.PropTypes.object,
    onChange:               React.PropTypes.func.isRequired,
    errors:                 React.PropTypes.array.isRequired,
    fFocused:               React.PropTypes.bool.isRequired,
  };

  componentDidUpdate(prevProps) {
    const { cmds } = this.props;
    if (!cmds || cmds === prevProps.cmds) return;
    cmds.forEach((cmd) => {
      if (cmd.type === 'CLICK') this.onClickButton();
    });
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const {
      children,
      registerOuterRef,
      disabled,
    } = this.props;
    const otherProps = omit(this.props, PROP_KEYS_TO_REMOVE_FROM_INPUT);
    return (
      <span ref={registerOuterRef}
        className="giu-file-input"
        style={style.outer(this.props)}
      >
        <input ref={this.registerInputRef}
          type="file"
          style={style.input}
          onChange={this.onChange}
          tabIndex={disabled ? -1 : undefined}
          {...otherProps}
        />
        <Button
          disabled={disabled}
          onClick={this.onClickButton}
        >
          {children || 'Choose a file…'}
        </Button>
        &nbsp;
        {this.renderFileName()}
      </span>
    );
  }

  renderFileName() {
    const { curValue } = this.props;
    if (curValue == null || !curValue.length) return null;
    const { name, size } = curValue[0];
    const sizeDesc = filesize(size, { round: 0 });
    return (
      <span>
        {name} [{sizeDesc}]
        {' '}
        <Icon icon="times" onClick={this.onClickClear} />
      </span>
    );
  }

  // ==========================================
  // Event handlers
  // ==========================================
  registerInputRef = (c) => {
    this.refInput = c;
    this.props.registerFocusableRef(c);
  }

  onClickButton = () => { if (this.refInput) this.refInput.click(); }
  onClickClear = (ev) => { this.props.onChange(ev, null); }

  onChange = (ev) => {
    const { files } = ev.target;
    if (!files || !files.length) return;
    this.props.onChange(ev, files);
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  outer: ({ fFocused, style: baseStyle }) => {
    let out = { border: '1px solid transparent' };
    if (fFocused) out = merge(out, GLOW);
    out = merge(out, baseStyle);
    return out;
  },
  input: HIDDEN_FOCUS_CAPTURE,
};

// ==========================================
// Miscellaneous
// ==========================================
const PROP_KEYS_TO_REMOVE_FROM_INPUT = Object.keys(FileInput.propTypes).concat([
  'keyDown', 'floatZ', 'floatPosition', 'onResizeOuter', 'styleOuter',
]);

// ==========================================
// Public API
// ==========================================
export default input(FileInput, { isNull, valueAttr: 'files' });
