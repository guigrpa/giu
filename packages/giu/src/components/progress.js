// @flow

import * as React from 'react';
import PropTypes from 'prop-types';

// ==========================================
// Component
// ==========================================
/* --
A wrapper for the native HTML `progress` element (with 100% width).
*All props are passed through to the `progress` element.
Remember that an indeterminate progress bar will be shown if you
don't specify the `value` prop (native HTML behaviour).*
-- */
class Progress extends React.PureComponent<Object> {
  refMdl: ?Object;

  componentDidMount() {
    if (this.context.theme === 'mdl' && this.refMdl) {
      this.refMdl.addEventListener('mdl-componentupgraded', this.mdlRefresh);
      window.componentHandler.upgradeElement(this.refMdl);
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
      <div
        ref={c => {
          this.refMdl = c;
        }}
        className={className}
        style={style.progress}
      />
    );
  }

  // ==========================================
  mdlRefresh = () => {
    if (!this.refMdl) return;
    const { value } = this.props;
    if (value == null) return;
    this.refMdl.MaterialProgress.setProgress(value * 100);
  };
}

Progress.contextTypes = { theme: PropTypes.any };

// ==========================================
// Styles
// ==========================================
const style = {
  progress: {
    width: '100%',
  },
};

// ==========================================
// Public API
// ==========================================
export default Progress;
