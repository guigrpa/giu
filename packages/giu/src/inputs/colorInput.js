// @flow

import React from 'react';
import tinycolor from 'tinycolor2';
import classnames from 'classnames';
import { KEYS, IS_IOS, IS_MOBILE_OR_TABLET } from '../gral/constants';
import type { KeyboardEventPars } from '../gral/types';
import { isAncestorNode, prefixClasses } from '../gral/helpers';
import Input from '../hocs/input';
import type { InputHocPublicProps } from '../hocs/input';
import { floatAdd, floatDelete, floatUpdate } from '../components/floats';
import type { FloatPosition, FloatAlign } from '../components/floats';
import ColorPicker from './colorPicker';
import IosFloatWrapper from './iosFloatWrapper';

const toInternalValue = val => val;
const toExternalValue = val => val;
const isNull = val => val == null;

const MANAGE_FOCUS_AUTONOMOUSLY = IS_MOBILE_OR_TABLET;

// ==========================================
// Declarations
// ==========================================
// -- Props:
// -- START_DOCS
type PublicProps = {
  ...$Exact<InputHocPublicProps>, // common to all inputs (check the docs!)
  className?: string,
  id?: string,
  disabled?: boolean,
  // Whether the complete color picker should be inlined or appear as a dropdown when clicked
  inlinePicker?: boolean,
  onCloseFloat?: () => any,
  floatPosition?: FloatPosition,
  floatAlign?: FloatAlign,
};
// -- END_DOCS

type Props = {
  ...$Exact<PublicProps>,
  // Input HOC
  curValue: ?string,
  onChange: Function,
  registerOuterRef: Function,
  fFocused: boolean,
  onFocus: Function,
  onBlur: Function,
};

// ==========================================
// Component
// ==========================================
class BaseColorInput extends React.Component<Props> {
  fInit = false;
  prevExtFocused: boolean;
  fFloat = false;
  floatId: ?string;
  refTitle: ?Object;
  refPicker: ?Object;

  componentDidMount() {
    window.addEventListener('click', this.onClickWindow);
  }

  componentWillUnmount() {
    if (this.floatId != null) floatDelete(this.floatId);
    window.removeEventListener('click', this.onClickWindow);
  }

  componentDidUpdate() {
    this.renderFloat();
  }

  // ==========================================
  // Imperative API
  // ==========================================
  doKeyDown(keyDown: KeyboardEventPars) {
    if (keyDown.which === KEYS.esc && !this.props.inlinePicker) {
      this.fFloat = !this.fFloat;
      this.forceUpdate();
    }
  }

  // ==========================================
  prepareRender() {
    const { fFocused } = this.props;
    if (!this.fInit || fFocused !== this.prevExtFocused) {
      this.prevExtFocused = fFocused;
      this.fFloat = fFocused;
    }
    this.fInit = true;
  }

  // ==========================================
  render() {
    this.prepareRender();
    if (this.props.inlinePicker) return this.renderPicker();
    return this.renderTitle();
  }

  renderTitle() {
    const { curValue } = this.props;
    const background =
      curValue != null ? tinycolor(curValue).toRgbString() : 'transparent';
    return (
      // The `x` text keeps baselines aligned
      <span
        ref={this.registerTitleRef}
        className={classnames(
          'giu-input-reset giu-color-input',
          {
            'giu-input-disabled': this.props.disabled,
            'giu-glow': this.props.fFocused,
          },
          this.props.className
        )}
        id={this.props.id}
        onMouseDown={this.onMouseDownTitle}
        onClick={this.onClickTitle}
      >
        <span style={{ color: 'transparent' }}>x</span>
        <span className="giu-color-input-swatch giu-transparency-tiles" />
        <span className="giu-color-input-swatch" style={{ background }} />
        {IS_IOS && this.renderFloatForIos()}
      </span>
    );
  }

  renderFloat() {
    if (this.props.inlinePicker) return;
    if (IS_IOS) return;
    const { fFloat } = this;

    // Remove float
    if (!fFloat && this.floatId != null) {
      floatDelete(this.floatId);
      this.floatId = null;
      this.props.onCloseFloat && this.props.onCloseFloat();
      return;
    }

    // Create or update float
    if (fFloat) {
      const { className, id, floatPosition, floatAlign } = this.props;
      const floatOptions = {
        className: classnames(
          'giu-float-color-input',
          prefixClasses(className, 'giu-float')
        ),
        id: id ? `giu-float-${id}` : undefined,
        position: floatPosition,
        align: floatAlign,
        getAnchorNode: () => this.refTitle,
        children: this.renderPicker(),
      };
      if (this.floatId == null) {
        this.floatId = floatAdd(floatOptions);
      } else {
        floatUpdate(this.floatId, floatOptions);
      }
    }
  }

  renderFloatForIos() {
    if (!this.fFloat) return null;
    const { floatPosition, floatAlign } = this.props;
    return (
      <IosFloatWrapper floatPosition={floatPosition} floatAlign={floatAlign}>
        {this.renderPicker()}
      </IosFloatWrapper>
    );
  }

  renderPicker() {
    const {
      inlinePicker,
      registerOuterRef,
      curValue,
      onChange,
      disabled,
      fFocused,
    } = this.props;
    return (
      <ColorPicker
        className={inlinePicker ? this.props.className : undefined}
        id={inlinePicker ? this.props.id : undefined}
        registerOuterRef={
          inlinePicker ? registerOuterRef : this.registerPickerRef
        }
        curValue={curValue}
        onChange={onChange}
        disabled={disabled}
        fFocused={!!inlinePicker && fFocused}
      />
    );
  }

  // ==========================================
  registerTitleRef = c => {
    this.refTitle = c;
    this.props.registerOuterRef(c);
  };

  registerPickerRef = c => {
    this.refPicker = c;
  };

  // If the menu is not focused, ignore it: it will be handled by the `input` HOC.
  // ...but if it is focused, we want to toggle it
  onMouseDownTitle = () => {
    if (!this.props.fFocused) return;
    this.fFloat = !this.fFloat;
    this.forceUpdate();
  };

  // Only for autonomous focus management
  onClickTitle = (ev: SyntheticEvent<*>) => {
    if (!MANAGE_FOCUS_AUTONOMOUSLY) return;
    if (this.props.fFocused) this.props.onBlur(ev);
    else this.props.onFocus(ev);
  };

  // Only for autonomous focus management
  // Handle click on window (hopefully, they won't swallow it) to blur
  onClickWindow = (ev: SyntheticEvent<*>) => {
    if (!MANAGE_FOCUS_AUTONOMOUSLY) return;
    const { target } = ev;
    // Discard click if it's on our own component (we'll handle it ourselves)
    if (target instanceof Element && isAncestorNode(this.refTitle, target)) {
      return;
    }
    if (this.props.fFocused) this.props.onBlur(ev);
  };
}

// ==========================================
const hocOptions = {
  componentName: 'ColorInput',
  toInternalValue,
  toExternalValue,
  isNull,
  fIncludeFocusCapture: !MANAGE_FOCUS_AUTONOMOUSLY,
  trappedKeys: [KEYS.esc],
  className: 'giu-color-input-wrapper',
};
const render = (props, ref) => <BaseColorInput {...props} ref={ref} />;
// $FlowFixMe
const ColorInput = React.forwardRef((publicProps: PublicProps, ref) => (
  <Input hocOptions={hocOptions} render={render} {...publicProps} ref={ref} />
));

// ==========================================
// Public
// ==========================================
export default ColorInput;
