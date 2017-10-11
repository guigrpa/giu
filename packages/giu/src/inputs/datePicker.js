// @flow

import React from 'react';
import moment from '../vendor/moment';
import { startOfToday, getTimeInSecs } from '../gral/dates';
import { flexContainer, isDark } from '../gral/styles';
import type { Moment, KeyboardEventPars } from '../gral/types';
import { COLORS, KEYS } from '../gral/constants';
import hoverable from '../hocs/hoverable';
import type { HoverableProps } from '../hocs/hoverable';
import Button from '../components/button';
import Icon from '../components/icon';

const ROW_HEIGHT = '1.3em';
const DAY_WIDTH = '2em';

// ==========================================
// Types
// ==========================================
type PublicProps = {|
  disabled: boolean,
  curValue: ?Moment,
  onChange: (ev: ?SyntheticEvent, nextValue: ?Moment) => any,
  utc: boolean,
  todayName: string,
  keyDown: ?KeyboardEventPars,
  accentColor: string,
|};

type Props = {
  ...PublicProps,
  ...$Exact<HoverableProps>,
};

// ==========================================
// Component
// ==========================================
class DatePicker extends React.Component {
  props: Props;
  static defaultProps = {};
  state: {
    shownMonthStart: Moment,
  };
  startOfCurValue: ?Moment;
  shownMonthNumber: number;

  constructor() {
    super();
    this.state = ({ shownMonthStart: null }: any);
  }

  componentWillMount() {
    this.updateShownMonth(this.props);
  }
  componentWillReceiveProps(nextProps: Props) {
    const prevValue = this.props.curValue;
    const nextValue = nextProps.curValue;
    if (prevValue != null || nextValue != null) {
      if (
        prevValue == null ||
        nextValue == null ||
        !prevValue.isSame(nextValue)
      ) {
        this.updateShownMonth(nextProps);
      }
    }
    const { keyDown } = nextProps;
    if (keyDown && keyDown !== this.props.keyDown) this.doKeyDown(keyDown);
  }

  updateShownMonth(props: Props) {
    const { curValue, utc } = props;
    const refMoment = curValue != null ? curValue.clone() : startOfToday(utc);
    const shownMonthStart = refMoment.startOf('month');
    this.setState({ shownMonthStart });
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { curValue, utc } = this.props;
    this.startOfCurValue =
      curValue != null ? curValue.clone().startOf('day') : null;
    this.shownMonthNumber = this.state.shownMonthStart.month();

    // Clone the `shownMonthStart` moment this way, so that it gets the correct locales
    // in case moment changes!
    const shownMonthStart = moment(this.state.shownMonthStart.valueOf());
    if (utc) shownMonthStart.utc();
    return (
      <div className="giu-date-picker" style={style.outer}>
        {this.renderMonth(shownMonthStart)}
        {this.renderDayNames()}
        {this.renderWeeks(shownMonthStart)}
        {this.renderToday()}
      </div>
    );
  }

  renderMonth(shownMonthStart: Moment) {
    const { disabled } = this.props;
    return (
      <div style={style.monthRow}>
        <div style={style.monthChange}>
          {!disabled && (
            <Icon icon="arrow-left" onClick={this.onClickPrevMonth} skipTheme />
          )}
        </div>
        <Button
          onClick={this.onClickMonthName}
          skipTheme
          plain
          style={style.monthName}
        >
          {shownMonthStart.format('MMMM YYYY')}
        </Button>
        <div style={style.monthChange}>
          {!disabled && (
            <Icon
              icon="arrow-right"
              onClick={this.onClickNextMonth}
              skipTheme
            />
          )}
        </div>
      </div>
    );
  }

  renderDayNames() {
    const dayNames = moment.weekdaysMin();
    const firstDayOfWeek = moment.localeData().firstDayOfWeek();
    const els = new Array(7);
    for (let i = 0; i < 7; i++) {
      const idx = (i + firstDayOfWeek) % 7;
      els[i] = (
        <div key={i} style={style.dayName}>
          {dayNames[idx]}
        </div>
      );
    }
    return <div style={style.dayNamesRow}>{els}</div>;
  }

  renderWeeks(shownMonthStart: Moment) {
    const curDate = shownMonthStart.clone();
    const endDate = moment(curDate).add(1, 'month');
    curDate.subtract(curDate.weekday(), 'days');
    const weeks = [];
    let i = 0;
    while (curDate.isBefore(endDate)) {
      weeks.push(this.renderWeek(curDate, i));
      curDate.add(1, 'week');
      i += 1;
    }
    return <div>{weeks}</div>;
  }

  renderWeek(weekStartDate: Moment, idx: number) {
    const curDate = moment(weekStartDate);
    const els = new Array(7);
    for (let i = 0; i < 7; i++) {
      els[i] = this.renderDay(curDate, i);
      curDate.add(1, 'day');
    }
    return (
      <div key={idx} style={style.week}>
        {els}
      </div>
    );
  }

  renderDay(mom: Moment, idx: number) {
    const { hovering, onHoverStart, onHoverStop } = this.props;
    const id = mom.toISOString();
    const fHovered = hovering === id;
    const fSelected =
      !!this.startOfCurValue && this.startOfCurValue.isSame(mom);
    const fInShownMonth = mom.month() === this.shownMonthNumber;
    return (
      <div
        key={idx}
        id={id}
        onClick={this.onClickDay}
        onMouseEnter={onHoverStart}
        onMouseLeave={onHoverStop}
        style={style.day(fSelected, fHovered, fInShownMonth, this.props)}
      >
        {mom.date()}
      </div>
    );
  }

  renderToday() {
    const { todayName } = this.props;
    return (
      <div onClick={this.onClickToday} style={style.today}>
        {todayName}
      </div>
    );
  }

  // ==========================================
  // Event handlers
  // ==========================================
  onClickMonthName = () => {
    const { utc } = this.props;
    const shownMonthStart = startOfToday(utc).startOf('month');
    this.setState({ shownMonthStart });
  };

  onClickPrevMonth = () => {
    this.changeShownMonth('subtract');
  };
  onClickNextMonth = () => {
    this.changeShownMonth('add');
  };
  changeShownMonth(op: 'subtract' | 'add') {
    const shownMonthStart = this.state.shownMonthStart.clone();
    if (op === 'add') {
      shownMonthStart.add(1, 'month');
    } else {
      shownMonthStart.subtract(1, 'month');
    }
    this.setState({ shownMonthStart });
  }

  onClickDay = (ev: SyntheticEvent) => {
    const { utc } = this.props;
    if (!(ev.target instanceof Element)) return;
    const startOfDay = moment(ev.target.id);
    if (utc) startOfDay.utc();
    this.changeDateTo(ev, startOfDay);
  };

  onClickToday = (ev: SyntheticEvent) => {
    const { utc } = this.props;
    const startOfDay = startOfToday(utc);
    this.changeDateTo(ev, startOfDay);
    this.onClickMonthName();
  };

  doKeyDown({ which, shiftKey, ctrlKey, altKey, metaKey }: KeyboardEventPars) {
    if (shiftKey || ctrlKey || altKey || metaKey) return;
    switch (which) {
      case KEYS.pageUp:
        this.onClickPrevMonth();
        break;
      case KEYS.pageDown:
        this.onClickNextMonth();
        break;
      case KEYS.right:
        this.changeDateByDays(+1);
        break;
      case KEYS.left:
        this.changeDateByDays(-1);
        break;
      case KEYS.down:
        this.changeDateByDays(+7);
        break;
      case KEYS.up:
        this.changeDateByDays(-7);
        break;
      case KEYS.home:
        this.goToStartEndOfMonth('start');
        break;
      case KEYS.end:
        this.goToStartEndOfMonth('end');
        break;
      case KEYS.del:
      case KEYS.backspace:
        this.props.onChange(null, null);
        break;
      default:
        break;
    }
  }

  // ==========================================
  // Helpers
  // ==========================================
  goToStartEndOfMonth(op: 'start' | 'end') {
    const startOfDay = this.state.shownMonthStart.clone();
    if (op === 'end') startOfDay.add(1, 'month').subtract(1, 'day');
    this.changeDateTo(null, startOfDay);
  }

  changeDateTo(ev: ?SyntheticEvent, startOfDay: Moment) {
    const { curValue } = this.props;
    const nextValue = startOfDay.clone();
    if (curValue != null) {
      const secs = getTimeInSecs(curValue);
      nextValue.add(moment.duration(secs, 'seconds'));
    }
    this.doChange(ev, nextValue);
  }

  changeDateByDays(days: number) {
    const { curValue } = this.props;
    if (curValue == null) {
      this.goToStartEndOfMonth(days >= 0 ? 'start' : 'end');
      return;
    }
    const nextValue = curValue.clone();
    nextValue.add(days, 'days');
    this.doChange(null, nextValue);
  }

  doChange(ev: ?SyntheticEvent, nextValue) {
    this.props.onChange(ev, nextValue);
  }
}

// ==========================================
// Styles
// ==========================================
const style = {
  outer: {
    maxWidth: '16em',
    padding: 3,
  },
  monthRow: flexContainer('row', {
    justifyContent: 'space-between',
    alignItems: 'baseline',
    height: ROW_HEIGHT,
  }),
  monthChange: {
    width: DAY_WIDTH,
    textAlign: 'center',
  },
  monthName: {
    fontWeight: 'bold',
  },
  dayNamesRow: flexContainer('row', {
    justifyContent: 'space-between',
    alignItems: 'baseline',
    height: ROW_HEIGHT,
  }),
  dayName: {
    width: DAY_WIDTH,
    textAlign: 'center',
  },
  week: flexContainer('row', {
    justifyContent: 'space-between',
    alignItems: 'baseline',
    height: ROW_HEIGHT,
  }),
  day: (
    fSelected: boolean,
    fHovered: boolean,
    fInShownMonth: boolean,
    { disabled, accentColor }: { disabled: boolean, accentColor: string }
  ) => {
    const fHighlightBorder = fSelected || (!disabled && fHovered);
    const border = `1px solid ${fHighlightBorder
      ? accentColor
      : 'transparent'}`;
    const backgroundColor = fSelected ? accentColor : undefined;
    let color;
    if (!fInShownMonth) {
      color = COLORS.dim;
    } else if (backgroundColor) {
      color = COLORS[isDark(backgroundColor) ? 'lightText' : 'darkText'];
    }
    return {
      border,
      backgroundColor,
      color,
      textAlign: 'center',
      cursor: !disabled ? 'pointer' : undefined,
      width: DAY_WIDTH,
    };
  },
  today: {
    textAlign: 'center',
    cursor: 'pointer',
    height: ROW_HEIGHT,
    fontWeight: 'bold',
  },
};

// ==========================================
// Public API
// ==========================================
export default hoverable(DatePicker);
