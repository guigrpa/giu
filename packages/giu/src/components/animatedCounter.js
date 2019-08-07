// @flow

import React from 'react';
import classnames from 'classnames';

const REFRESH_PERIOD = 25; // [ms]
const TRANSITION_DURATION = 500; // [ms]

// ==========================================
// Declarations
// ==========================================
// Undocumented component!
type Props = {
  className?: string,
  id?: string,
  value: ?number,
  nullLabel?: string,
  decimals?: number,
  formatter?: (value: ?number) => string,
};

// ==========================================
// Component
// ==========================================
class AnimatedCounter extends React.PureComponent<Props> {
  timer: ?IntervalID;
  timerLeft: number;
  shownValue: ?number;
  targetValue: ?number;

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  componentDidUpdate() {
    const { value } = this.props;
    if (value !== this.targetValue) {
      this.targetValue = value;
      this.startTimer();
    }
  }

  // ==========================================
  render() {
    let shownValue;
    if (this.props.formatter) {
      shownValue = this.props.formatter(this.shownValue);
    } else if (this.shownValue == null) {
      shownValue = this.props.nullLabel || '–';
    } else {
      shownValue = this.shownValue.toFixed(this.props.decimals || 0);
    }
    return (
      <span
        className={classnames('giu-animated-counter', this.props.className)}
        id={this.props.id}
      >
        {shownValue}
      </span>
    );
  }

  // ==========================================
  startTimer() {
    this.stopTimer();
    this.timerLeft = TRANSITION_DURATION;
    this.timer = setInterval(this.refreshValue, REFRESH_PERIOD);
  }

  stopTimer() {
    if (this.timer != null) clearInterval(this.timer);
    this.timer = null;
  }

  refreshValue = () => {
    this.timerLeft -= REFRESH_PERIOD;
    if (this.timerLeft <= 0) {
      this.shownValue = this.targetValue;
      this.timerLeft = 0;
      this.forceUpdate();
      this.stopTimer();
      return;
    }
    const curValue = this.shownValue != null ? this.shownValue : 0;
    const targetValue = this.targetValue != null ? this.targetValue : 0;
    this.shownValue +=
      ((targetValue - curValue) * REFRESH_PERIOD) / this.timerLeft;
    if (Number.isNaN(this.shownValue)) this.shownValue = targetValue;
    this.forceUpdate();
  };
}

// ==========================================
// Public
// ==========================================
export default AnimatedCounter;
