// @flow

import React from 'react';
import { omit, merge } from 'timm';
import filesize from 'filesize';
import { GLOW, HIDDEN_FOCUS_CAPTURE } from '../gral/styles';
import input, { INPUT_HOC_INVALID_HTML_PROPS } from '../hocs/input';
import type { Command } from '../gral/types';
import Button from '../components/button';
import Icon from '../components/icon';

const isNull = val => val == null;

// ==========================================
// Types
// ==========================================
// -- Props:
// -- START_DOCS
type PublicProps = {
  children?: any, // React elements that will be shown inside the button(default: `Choose file…`)
  cmds?: Array<Command>,
  disabled?: boolean,
  style?: Object, // will be merged with the outermost `span` element
  skipTheme?: boolean,
  // all others are passed through unchanged
};
// -- END_DOCS

type Props = {
  ...$Exact<PublicProps>,
  // Input HOC
  curValue: ?Object,
  onChange: (ev: SyntheticEvent, providedValue: any) => any,
  registerOuterRef: Function,
  registerFocusableRef: Function,
  errors: Array<string>,
  fFocused: boolean,
};

const FILTERED_OUT_PROPS = [
  'style',
  'skipTheme',
  'children',
  ...INPUT_HOC_INVALID_HTML_PROPS,
];

// ==========================================
// Component
// ==========================================
class FileInput extends React.Component {
  static defaultProps = {};
  props: Props;
  cntCleared: number;
  refInput: ?Object;

  constructor() {
    super();
    this.cntCleared = 0;
  }

  componentDidUpdate(prevProps) {
    const { cmds } = this.props;
    if (!cmds || cmds === prevProps.cmds) return;
    cmds.forEach(cmd => {
      if (cmd.type === 'CLICK') this.onClickButton();
    });
  }

  // ==========================================
  render() {
    const { children, registerOuterRef, disabled } = this.props;
    const otherProps = omit(this.props, FILTERED_OUT_PROPS);
    return (
      <span
        ref={registerOuterRef}
        className="giu-file-input"
        style={style.outer(this.props)}
      >
        <input
          ref={this.registerInputRef}
          key={this.cntCleared}
          type="file"
          style={style.input}
          onChange={this.onChange}
          tabIndex={disabled ? -1 : undefined}
          {...otherProps}
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
        {name} [{sizeDesc}]
        {' '}
        <Icon
          icon={!skipTheme && this.context.theme === 'mdl' ? 'clear' : 'times'}
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

FileInput.contextTypes = { theme: React.PropTypes.any };

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
// Public
// ==========================================
export default input(FileInput, { isNull, valueAttr: 'files' });
