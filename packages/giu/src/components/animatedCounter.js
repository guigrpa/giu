// @flow

import React from 'react';

const REFRESH_PERIOD = 25; // [ms]
const TRANSITION_DURATION = 500; // [ms]

// ==========================================
// Declarations
// ==========================================
type Props = {
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
  value: ?number;
  targetValue: ?number;

  constructor(props: Props) {
    super(props);
    this.value = null;
    this.targetValue = props.value;
  }

  componentDidMount() {
    if (this.targetValue != null) this.startTimer();
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  componentWillReceiveProps(nextProps: Props) {
    const { value } = nextProps;
    if (value !== this.props.value) {
      this.targetValue = value;
      this.startTimer();
    }
  }

  startTimer() {
    this.stopTimer();
    this.timerLeft = TRANSITION_DURATION;
    this.timer = setInterval(this.recalcValue, REFRESH_PERIOD);
  }

  stopTimer() {
    if (this.timer != null) clearInterval(this.timer);
    this.timer = null;
  }

  recalcValue = () => {
    this.timerLeft -= REFRESH_PERIOD;
    if (this.timerLeft <= 0) {
      this.value = this.targetValue;
      this.timerLeft = 0;
      this.forceUpdate();
      this.stopTimer();
      return;
    }
    const curValue = this.value != null ? this.value : 0;
    const targetValue = this.targetValue != null ? this.targetValue : 0;
    this.value += (targetValue - curValue) * REFRESH_PERIOD / this.timerLeft;
    if (Number.isNaN(this.value)) this.value = targetValue;
    this.forceUpdate();
  };

  // ==========================================
  render() {
    let value;
    if (this.props.formatter) {
      value = this.props.formatter(this.value);
    } else if (this.value == null) {
      value = this.props.nullLabel || '–';
    } else {
      value = this.value.toFixed(this.props.decimals || 0);
    }
    return <span>{value}</span>;
  }
}

// ==========================================
// Public
// ==========================================
export default AnimatedCounter;
