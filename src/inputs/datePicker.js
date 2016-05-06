import React                from 'react';
import moment               from 'moment';
import {
  bindAll,
}                           from '../gral/helpers';
import {
  startOfToday,
  getTimeInSecs,
}                           from '../gral/dates';
import {
  flexContainer,
  isDark,
}                           from '../gral/styles';
import { COLORS, KEYS }     from '../gral/constants';
import hoverable            from '../hocs/hoverable';
import Button               from '../components/button';
import Icon                 from '../components/icon';

const ROW_HEIGHT = '1.3em';
const DAY_WIDTH = '2em';

// ==========================================
// Component
// ==========================================
class DatePicker extends React.Component {
  static propTypes = {
    disabled:               React.PropTypes.bool.isRequired,
    curValue:               React.PropTypes.object,  // moment object, not start of day
    onChange:               React.PropTypes.func.isRequired,
    utc:                    React.PropTypes.bool.isRequired,
    todayName:              React.PropTypes.string.isRequired,
    cmds:                   React.PropTypes.array,
    accentColor:            React.PropTypes.string.isRequired,
    // Hoverable HOC
    hovering:               React.PropTypes.any,
    onHoverStart:           React.PropTypes.func.isRequired,
    onHoverStop:            React.PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.state = { shownMonthStart: null };
    bindAll(this, [
      'onClickMonthName',
      'onClickDay',
      'onClickToday',
      'onClickPrevMonth',
      'onClickNextMonth',
    ]);
  }

  componentWillMount() { this.updateShownMonth(this.props); }
  componentWillReceiveProps(nextProps) {
    const prevValue = this.props.curValue;
    const nextValue = nextProps.curValue;
    if (prevValue == null && nextValue == null) return;
    if (prevValue == null || nextValue == null || !prevValue.isSame(nextValue)) {
      this.updateShownMonth(nextProps);
    }
  }

  updateShownMonth(props) {
    const { curValue, utc } = props;
    const refMoment = curValue != null ? curValue.clone() : startOfToday(utc);
    const shownMonthStart = refMoment.startOf('month');
    this.setState({ shownMonthStart });
  }

  componentDidUpdate(prevProps) {
    const { cmds } = this.props;
    if (!cmds) return;
    if (cmds !== prevProps.cmds) {
      for (const cmd of cmds) {
        switch (cmd.type) {
          case 'KEY_DOWN':
            this.doKeyDown(cmd.which);
            break;
          default:
            break;
        }
      }
    }
  }

  // ==========================================
  // Render
  // ==========================================
  render() {
    const { curValue, utc } = this.props;
    this.startOfCurValue = curValue != null ? curValue.clone().startOf('day') : null;
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

  renderMonth(shownMonthStart) {
    return (
      <div style={style.monthRow}>
        <div style={style.monthChange}>
          <Icon icon="arrow-left" onClick={this.onClickPrevMonth} />
        </div>
        <Button onClick={this.onClickMonthName} plain>
          {shownMonthStart.format('MMMM YYYY')}
        </Button>
        <div style={style.monthChange}>
          <Icon icon="arrow-right" onClick={this.onClickNextMonth} />
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

  renderWeeks(shownMonthStart) {
    const curDate = shownMonthStart.clone();
    const endDate = moment(curDate).add(1, 'month');
    curDate.subtract(curDate.weekday(), 'days');
    const weeks = [];
    let i = 0;
    while (curDate < endDate) {
      weeks.push(this.renderWeek(curDate, i));
      curDate.add(1, 'week');
      i++;
    }
    return <div>{weeks}</div>;
  }

  renderWeek(weekStartDate, idx) {
    const curDate = moment(weekStartDate);
    const els = new Array(7);
    for (let i = 0; i < 7; i++) {
      els[i] = this.renderDay(curDate, i);
      curDate.add(1, 'day');
    }
    return <div key={idx} style={style.week}>{els}</div>;
  }

  renderDay(mom, idx) {
    const { hovering, onHoverStart, onHoverStop } = this.props;
    const id = mom.toISOString();
    const fHovered = hovering === id;
    const fSelected = this.startOfCurValue && this.startOfCurValue.isSame(mom);
    const fInShownMonth = mom.month() === this.shownMonthNumber;
    return (
      <div key={idx}
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
      <div
        onClick={this.onClickToday}
        style={style.today}
      >
        {todayName}
      </div>
    );
  }

  // ==========================================
  // Event handlers
  // ==========================================
  onClickMonthName() {
    const { utc } = this.props;
    const shownMonthStart = startOfToday(utc).startOf('month');
    this.setState({ shownMonthStart });
  }

  onClickPrevMonth() { this.changeShownMonth('subtract'); }
  onClickNextMonth() { this.changeShownMonth('add'); }
  changeShownMonth(op) {
    const shownMonthStart = this.state.shownMonthStart.clone();
    shownMonthStart[op](1, 'month');
    this.setState({ shownMonthStart });
  }

  onClickDay(ev) {
    const { utc } = this.props;
    const startOfDay = moment(ev.target.id);
    if (utc) startOfDay.utc();
    this.changeDateTo(ev, startOfDay);
  }

  onClickToday(ev) {
    const { utc } = this.props;
    const startOfDay = startOfToday(utc);
    this.changeDateTo(ev, startOfDay);
  }

  doKeyDown(which) {
    switch (which) {
      case KEYS.pageUp:   this.onClickPrevMonth();           break;
      case KEYS.pageDown: this.onClickNextMonth();           break;
      case KEYS.right:    this.changeDateByDays(+1);         break;
      case KEYS.left:     this.changeDateByDays(-1);         break;
      case KEYS.down:     this.changeDateByDays(+7);         break;
      case KEYS.up:       this.changeDateByDays(-7);         break;
      case KEYS.home:     this.goToStartEndOfMonth('start'); break;
      case KEYS.end:      this.goToStartEndOfMonth('end');   break;
      case KEYS.del:
      case KEYS.backspace:
        this.props.onChange(null, null);
        break;
      default: break;
    }
  }

  // ==========================================
  // Helpers
  // ==========================================
  goToStartEndOfMonth(op) {
    const startOfDay = this.state.shownMonthStart.clone();
    if (op === 'end') startOfDay.add(1, 'month').subtract(1, 'day');
    this.changeDateTo(null, startOfDay);
  }

  changeDateTo(ev, startOfDay) {
    const { curValue } = this.props;
    const nextValue = startOfDay.clone();
    if (curValue != null) {
      const secs = getTimeInSecs(curValue);
      nextValue.add(moment.duration(secs, 'seconds'));
    }
    this.doChange(ev, nextValue);
  }

  changeDateByDays(days) {
    const { curValue } = this.props;
    if (curValue == null) {
      this.goToStartEndOfMonth(days >= 0 ? 'start' : 'end');
      return;
    }
    const nextValue = curValue.clone();
    nextValue.add(days, 'days');
    this.doChange(null, nextValue);
  }

  doChange(ev, nextValue) {
    this.props.onChange(ev, nextValue);
    // Not needed
    // const shownMonthStart = nextValue.clone().startOf('month');
    // this.setState({ shownMonthStart });
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
    height: ROW_HEIGHT,
  }),
  monthChange: {
    width: DAY_WIDTH,
    textAlign: 'center',
  },
  monthName: {
    cursor: 'pointer',
  },
  dayNamesRow: flexContainer('row', {
    justifyContent: 'space-between',
    height: ROW_HEIGHT,
  }),
  dayName: {
    width: DAY_WIDTH,
    textAlign: 'center',
  },
  week: flexContainer('row', {
    justifyContent: 'space-between',
    height: ROW_HEIGHT,
  }),
  day: (fSelected, fHovered, fInShownMonth, { disabled, accentColor }) => {
    const fHighlightBorder = fSelected || (!disabled && fHovered);
    const border = `1px solid ${fHighlightBorder ? accentColor : 'transparent'}`;
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
      textAlign: 'center',
    };
  },
  today: {
    textAlign: 'center',
    cursor: 'pointer',
    height: ROW_HEIGHT,
  },
};

// ==========================================
// Public API
// ==========================================
export default hoverable(DatePicker);
