// @flow

import React from 'react';
import PropTypes from 'prop-types';

// ==========================================
// Component
// ==========================================
type Props = Object;

/* --
A wrapper for the native HTML `progress` element (with 100% width).
*All props are passed through to the `progress` element.
Remember that an indeterminate progress bar will be shown if you
don't specify the `value` prop (native HTML behaviour).*
-- */
class Progress extends React.PureComponent<Props> {
  refMdl = React.createRef();

  componentDidMount() {
    const nodeMdl = this.refMdl.current;
    if (this.context.theme === 'mdl' && nodeMdl) {
      nodeMdl.addEventListener('mdl-componentupgraded', this.mdlRefresh);
      window.componentHandler.upgradeElement(nodeMdl);
    }
  }

  componentDidUpdate() {
    this.mdlRefresh();
  }

  // ==========================================
  render() {
    if (this.context.theme === 'mdl') return this.renderMdl();
    return <progress {...this.props} style={style.progress} />;
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

Progress.contextTypes = { theme: PropTypes.any };

// ==========================================
const style = {
  progress: { width: '100%' },
};

// ==========================================
// Public
// ==========================================
export default Progress;
