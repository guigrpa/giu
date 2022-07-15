// @flow

import React from 'react';
import classnames from 'classnames';
import { ThemeContext } from '../gral/themeContext';
import type { Theme } from '../gral/themeContext';

// ==========================================
// Declarations
// ==========================================
/* --
A wrapper for the native HTML `progress` element (with 100% width).
-- */
// -- START_DOCS
type PublicProps = {
  className?: string,
  id?: string,
  value: any,
};
// -- END_DOCS
type Props = {
  ...$Exact<PublicProps>,
  // Context
  theme: Theme,
};

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
    return (
      <progress
        className={classnames('giu-progress', this.props.className)}
        id={this.props.id}
        value={this.props.value}
      />
    );
  }

  renderMdl() {
    return (
      <div
        ref={this.refMdl}
        className={classnames(
          'giu-progress mdl-progress mdl-js-progress',
          { 'mdl-progress--indeterminate': this.props.value == null },
          this.props.className
        )}
        id={this.props.id}
        value={this.props.value}
      />
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
    {(theme) => <Progress {...props} theme={theme} />}
  </ThemeContext.Consumer>
);

// ==========================================
// Public
// ==========================================
export default ThemedProgress;
