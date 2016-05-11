import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import {
  createStore,
  applyMiddleware,
}                           from 'redux';
import thunk                from 'redux-thunk';
import {
  updateIn,
  addLast,
  removeAt,
  addDefaults,
}                           from 'timm';
import { bindAll }          from '../gral/helpers';
import Notification         from './notification';

// ==========================================
// Store, reducer
// ==========================================
let store = null;
function initStore() {
  const storeEnhancers = applyMiddleware(thunk);
  store = createStore(reducer, storeEnhancers);
}

const INITIAL_STATE = [];
function reducer(state0 = INITIAL_STATE, action) {
  let state = state0;
  let id;
  let name;
  let idx;
  switch (action.type) {
    case 'NOTIFY':
      state = addLast(state, action.pars);
      break;
    case 'NOTIF_RETAIN':
      id = action.id;
      idx = state.findIndex(o => o.id === id);
      if (idx >= 0) {
        state = updateIn(state, [idx, 'retained'], () => true);
      }
      break;
    case 'NOTIF_DELETE':
      id = action.id;
      idx = state.findIndex(o => o.id === id);
      if (idx >= 0 && !(action.fAuto && state[idx].retained)) {
        state = removeAt(state, idx);
      }
      break;
    case 'NOTIF_DELETE_BY_NAME':
      name = action.name;
      idx = state.findIndex(o => o.name === name);
      if (idx >= 0) {
        state = removeAt(state, idx);
      }
      break;
    default:
      break;
  }
  return state;
}

// ==========================================
// Action creators
// ==========================================
let cntId = 0;
const DEFAULT_NOTIF_PARS = {
  name:       '',
  retained:   false,
  sticky:     false,
  timeOut:    4000,
  type:       undefined,
  icon:       undefined,
  iconSpin:   false,
  title:      '',
  msg:        '',
};
const actions = {
  notify: initialPars => dispatch => {
    const id = `notif_${cntId++}`;
    const pars = addDefaults(initialPars, DEFAULT_NOTIF_PARS, { id });
    dispatch({ type: 'NOTIFY', pars });
    if (!pars.sticky) {
      setTimeout(() => {
        dispatch({ type: 'NOTIF_DELETE', id, fAuto: true });
      }, pars.timeOut);
    }
    return pars;
  },
  notifRetain: id => ({ type: 'NOTIF_RETAIN', id }),
  notifDelete: id => ({ type: 'NOTIF_DELETE', id }),
  notifDeleteByName: name => ({ type: 'NOTIF_DELETE_BY_NAME', name }),
};

// Imperative dispatching
const notify = initialPars => {
  const pars = store.dispatch(actions.notify(initialPars));
  return pars.id;
};
const notifRetain = id => store.dispatch(actions.notifRetain(id));
const notifDelete = id => store.dispatch(actions.notifDelete(id));
const notifDeleteByName = name => store.dispatch(actions.notifDeleteByName(name));

// ==========================================
// Notifications component
// ==========================================
class Notifications extends React.Component {
  static propTypes = {
    notifs:                 React.PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this);
    bindAll(this, [
      'onRetain',
      'onDismiss',
    ]);
    if (props.notifs == null) {
      if (!store) initStore();
      this.storeUnsubscribe = store.subscribe(this.forceUpdate.bind(this));
    }
  }

  componentWillUnmount() { if (this.storeUnsubscribe) this.storeUnsubscribe(); }

  // ==========================================
  render() {
    const notifs = this.props.notifs || store.getState();
    return (
      <div
        className="giu-notifications"
        style={style.outer}
      >
        {notifs.map(props =>
          <Notification key={props.id}
            {...props}
            onHoverStart={this.onRetain}
            onHoverStop={this.onDismiss}
            onClick={this.onDismiss}
            noStylePosition
          />
        )}
      </div>
    );
  }

  // ==========================================
  onRetain(ev) { store.dispatch(actions.notifRetain(ev.currentTarget.id)); }
  onDismiss(ev) { store.dispatch(actions.notifDelete(ev.currentTarget.id)); }
}

// ==========================================
// Styles
// ==========================================
const style = {
  outer: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    maxWidth: 350,
    zIndex: 1, // show it above GPU-accel'd layers, e.g. svg components
  },
};

// ==========================================
// Public API
// ==========================================
export {
  Notifications,
  reducer,
  actions,
  notify, notifRetain, notifDelete, notifDeleteByName,
};
