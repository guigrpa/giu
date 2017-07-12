// @flow

import React from 'react';
import moment from '../vendor/moment';
import { startOfToday, getTimeInSecs } from '../gral/dates';
import type { Moment, Choice, KeyboardEventPars } from '../gral/types';
import { getScrollbarWidth, NULL_STRING } from '../gral/constants';
import { ListPicker } from '../inputs/listPicker';

const ROW_HEIGHT = '1.3em';

// ==========================================
// Types
// ==========================================
type PublicProps = {|
  disabled: boolean,
  curValue: ?Moment,
  onChange: (ev: ?SyntheticEvent, value: ?Moment) => any,
  utc: boolean,
  keyDown?: KeyboardEventPars,
  stepMinutes?: number,
  accentColor: string,
|};

type DefaultProps = {
  stepMinutes: number,
};

type Props = {
  ...PublicProps,
  ...$Exact<DefaultProps>,
};

// ==========================================
// Component
// ==========================================
class TimePickerDigital extends React.Component {
  props: Props;
  static defaultProps: DefaultProps = {
    stepMinutes: 30,
  };
  timeItems: Array<Choice>;

  componentWillMount() {
    this.initTimeItems();
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { keyDown, disabled, accentColor } = this.props;
    return (
      <ListPicker
        items={this.timeItems}
        curValue={this.getSeconds()}
        onChange={this.onChange}
        keyDown={keyDown}
        disabled={disabled}
        style={style.outer}
        twoStageStyle
        styleItem={style.item}
        accentColor={accentColor}
      />
    );
  }

  // ==========================================
  // Event handlers
  // ==========================================
  onChange = (ev: ?SyntheticEvent, secsStr: string) => {
    const { curValue, utc, onChange } = this.props;
    if (secsStr === NULL_STRING) {
      onChange(ev, null);
      return;
    }
    const secs = Number(secsStr);
    let nextValue;
    if (curValue != null) {
      nextValue = curValue.clone().startOf('day');
    } else {
      nextValue = startOfToday(utc);
    }
    nextValue.add(moment.duration(secs, 'seconds'));
    onChange(ev, nextValue);
  };

  // ==========================================
  // Helpers
  // ==========================================
  initTimeItems() {
    const { stepMinutes } = this.props;
    this.timeItems = [];
    const curTime = moment.utc('2013-04-27T00:00:00Z');
    const endTime = moment(curTime).add(1, 'day');
    while (curTime < endTime) {
      const label = curTime.format('HH:mm');
      const value = String(getTimeInSecs(curTime));
      this.timeItems.push({ label, value });
      curTime.add(stepMinutes, 'minutes');
    }
  }

  getSeconds() {
    const { curValue, stepMinutes } = this.props;
    if (curValue == null) return NULL_STRING;
    let secs = getTimeInSecs(curValue);
    secs = Math.round(secs / 60 / stepMinutes) * stepMinutes * 60;
    if (secs === 24 * 3600) secs -= stepMinutes * 60;
    return String(secs);
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  outer: {
    marginTop: 3,
    marginBottom: 3,
    padding: 0,
    border: 'none',
    maxHeight: '12.5em',
  },
  item: {
    padding: `0px ${6 + getScrollbarWidth()}px 0px 6px`,
    height: ROW_HEIGHT,
    cursor: 'pointer',
  },
};

// ==========================================
// Public API
// ==========================================
export default TimePickerDigital;
