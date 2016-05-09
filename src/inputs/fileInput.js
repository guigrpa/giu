import React                from 'react';
import { omit }             from 'timm';
import filesize             from 'filesize';
import { bindAll }          from '../gral/helpers';
import input                from '../hocs/input';
import Button               from '../components/button';
import Icon                 from '../components/icon';

// ==========================================
// Component
// ==========================================
class FileInput extends React.Component {
  static propTypes = {
    children:               React.PropTypes.any,
    cmds:                   React.PropTypes.array,
    style:                  React.PropTypes.object,
    // Input HOC
    curValue:               React.PropTypes.object,
    onChange:               React.PropTypes.func.isRequired,
    errors:                 React.PropTypes.array.isRequired,
    registerOuterRef:       React.PropTypes.func.isRequired,
    registerFocusableRef:   React.PropTypes.func.isRequired,
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
    for (const cmd of cmds) {
      if (cmd.type === 'CLICK') this.onClickButton();
    }
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const {
      children,
      registerOuterRef,
      style: baseStyle,
    } = this.props;
    const otherProps = omit(this.props, PROP_KEYS);
    return (
      <div ref={registerOuterRef}
        className="giu-file-input"
        style={baseStyle}
      >
        <input ref={this.registerInputRef}
          type="file"
          style={style.input}
          onChange={this.onChange}
          {...otherProps}
        />
        <Button onClick={this.onClickButton}>
          {children || 'Choose a file…'}
        </Button>
        &nbsp;
        {this.renderFileName()}
      </div>
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
  input: {
    position: 'fixed',
    opacity: 0,
    width: 10,
    height: 10,
    padding: 0,
    cursor: 'default',
    pointerEvents: 'none',
    zIndex: -80,
    top: 8,
    left: 8,
  },
};

// ==========================================
// Miscellaneous
// ==========================================
const PROP_KEYS = Object.keys(FileInput.propTypes);

// ==========================================
// Public API
// ==========================================
export default input(FileInput, { valueAttr: 'files' });
