import React                from 'react';
import { omit, merge }      from 'timm';
import filesize             from 'filesize';
import { bindAll }          from '../gral/helpers';
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

  constructor(props) {
    super(props);
    bindAll(this, [
      'registerInputRef',
      'onClickButton',
      'onClickClear',
      'onChange',
    ]);
  }

  componentDidUpdate(prevProps) {
    const { cmds } = this.props;
    if (!cmds || cmds === prevProps.cmds) return;
    cmds.forEach(cmd => {
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
    const otherProps = omit(this.props, PROP_KEYS);
    return (
      <span ref={registerOuterRef}
        className="giu-file-input"
        style={style.outer(this.props)}
      >
        <input ref={this.registerInputRef}
          type="file"
          style={style.input}
          onChange={this.onChange}
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
  registerInputRef(c) {
    this.refInput = c;
    this.props.registerFocusableRef(c);
  }

  onClickButton() { if (this.refInput) this.refInput.click(); }
  onClickClear(ev) { this.props.onChange(ev, null); }

  onChange(ev) {
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
const PROP_KEYS = Object.keys(FileInput.propTypes);

// ==========================================
// Public API
// ==========================================
export default input(FileInput, { isNull, valueAttr: 'files' });
