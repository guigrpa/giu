// @flow

import React from 'react';
import filesize from 'filesize';
import classnames from 'classnames';
import Input from '../hocs/input';
import type { InputHocPublicProps } from '../hocs/input';
import type { Theme } from '../gral/themeContext';
import Button from '../components/button';
import Icon from '../components/icon';

const isNull = val => val == null;

// ==========================================
// Declarations
// ==========================================
// -- Props:
// -- START_DOCS
type PublicProps = {
  ...$Exact<InputHocPublicProps>, // common to all inputs (check the docs!)
  className?: string,
  id?: string,
  children?: any, // React elements that will be shown inside the button(default: `Choose file…`)
  disabled?: boolean,
  skipTheme?: boolean,
};
// -- END_DOCS

type Props = {
  ...$Exact<PublicProps>,
  // Input HOC
  theme: Theme,
  curValue: ?Object,
  onChange: (ev: SyntheticEvent<*>, providedValue: any) => any,
  registerOuterRef: Function,
  registerFocusableRef: Function,
  errors: Array<string>,
  fFocused: boolean,
};

// ==========================================
// Component
// ==========================================
class BaseFileInput extends React.Component<Props> {
  refInput: ?Object;

  cntCleared: number = 0;

  // ==========================================
  // Imperative API
  // ==========================================
  runCommand(cmd: Object) {
    if (cmd.type === 'CLICK') this.onClickButton();
  }

  // ==========================================
  render() {
    const { children, registerOuterRef, disabled } = this.props;
    return (
      <span
        ref={registerOuterRef}
        className={classnames(
          'giu-file-input',
          { 'giu-glow': this.props.fFocused },
          this.props.className
        )}
        id={this.props.id}
      >
        <input
          ref={this.registerInputRef}
          key={this.cntCleared}
          className="giu-hidden-field"
          type="file"
          onChange={this.onChange}
          tabIndex={disabled ? -1 : undefined}
        />
        <Button
          disabled={disabled}
          onClick={this.onClickButton}
          skipTheme={this.props.skipTheme}
        >
          {children || 'Choose a file…'}
        </Button>
        &nbsp;
        {this.renderFileName()}
      </span>
    );
  }

  renderFileName() {
    const { curValue, skipTheme } = this.props;
    if (curValue == null || !curValue.length) return null;
    const { name, size } = curValue[0];
    const sizeDesc = filesize(size, { round: 0 });
    return (
      <span>
        {name} [{sizeDesc}]{' '}
        <Icon
          icon={!skipTheme && this.props.theme.id === 'mdl' ? 'clear' : 'times'}
          onClick={this.onClickClear}
          skipTheme={skipTheme}
        />
      </span>
    );
  }

  // ==========================================
  registerInputRef = c => {
    this.refInput = c;
    this.props.registerFocusableRef(c);
  };

  onClickButton = () => {
    if (this.refInput) this.refInput.click();
  };
  onClickClear = ev => {
    this.cntCleared += 1; // make sure we get a new file input (it has memory!)
    this.props.onChange(ev, null);
  };

  onChange = ev => {
    const { files } = ev.target;
    if (!files || !files.length) return;
    this.props.onChange(ev, files);
  };
}

// ==========================================
const hocOptions = {
  componentName: 'FileInput',
  isNull,
  valueAttr: 'files',
  className: 'giu-file-input-wrapper',
};
const render = (props, ref) => <BaseFileInput {...props} ref={ref} />;
// $FlowFixMe
const FileInput = React.forwardRef((publicProps: PublicProps, ref) => (
  <Input hocOptions={hocOptions} render={render} {...publicProps} ref={ref} />
));

// ==========================================
// Public
// ==========================================
export default FileInput;
