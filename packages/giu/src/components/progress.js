// @flow

import React from 'react';
import { omit } from 'timm';
import { ThemeContext } from '../gral/themeContext';
import type { Theme } from '../gral/themeContext';

// ==========================================
// Declarations
// ==========================================
/* --
A wrapper for the native HTML `progress` element (with 100% width).
*All props are passed through to the `progress` element.
Remember that an indeterminate progress bar will be shown if you
don't specify the `value` prop (native HTML behaviour).*
-- */
// -- START_DOCS
type PublicProps = {
  value: any,
  // All other props are passed through to the `progress` element
  // (except in the `mdl` theme, in which no props are passed)
};
// -- END_DOCS
type Props = {
  ...$Exact<PublicProps>,
  // Context
  theme: Theme,
};
const FILTERED_PROPS = ['theme'];

// ==========================================
// Component
// ==========================================
class Progress extends React.PureComponent<Props> {
  refMdl: any = React.createRef();

  componentDidMount() {
    const nodeMdl = this.refMdl.current;
    if (this.props.theme.id === 'mdl' && nodeMdl) {
      nodeMdl.addEventListener('mdl-componentupgraded', this.mdlRefresh);
      window.componentHandler.upgradeElement(nodeMdl);
    }
  }

  componentDidUpdate() {
    this.mdlRefresh();
  }

  // ==========================================
  render() {
    if (this.props.theme.id === 'mdl') return this.renderMdl();
    const otherProps = omit(this.props, FILTERED_PROPS);
    return <progress {...otherProps} style={style.progress} />;
  }

  renderMdl() {
    let className = 'mdl-progress mdl-js-progress';
    if (this.props.value == null) className += ' mdl-progress--indeterminate';
    return (
      <div ref={this.refMdl} className={className} style={style.progress} />
    );
  }

  // ==========================================
  mdlRefresh = () => {
    if (!this.refMdl.current) return;
    const { value } = this.props;
    if (value == null) return;
    this.refMdl.current.MaterialProgress.setProgress(value * 100);
  };
}

// ==========================================
const ThemedProgress = (props: PublicProps) => (
  <ThemeContext.Consumer>
    {theme => <Progress {...props} theme={theme} />}
  </ThemeContext.Consumer>
);

// ==========================================
const style = {
  progress: { width: '100%' },
};

// ==========================================
// Public
// ==========================================
export default ThemedProgress;
