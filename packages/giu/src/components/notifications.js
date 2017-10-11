// @flow

/* eslint-disable no-plusplus */

import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import type { Reducer } from 'redux';
import thunk from 'redux-thunk';
import { updateIn, addLast, removeAt, addDefaults } from 'timm';
import { MISC } from '../gral/constants';
import type { Action } from '../gral/types';
import Notification from './notification';
import type { NotificationPars } from './notificationTypes';

/* --
**Include the `<Notifications />` component at (or near)
the root level of your React tree**. No props are required.
Here's an example on how you would create a notification:

```js
import { notify, Button } from 'giu';
const NotifExample = () =>
  <Button onClick={() => notify({ msg: 'Idea!', icon: 'lightbulb-o' })}>
    Inspire me!
  </Button>;
```

API reference:

* **notify()**: creates a notification:
  - **pars** *NotificationPars*: notification parameters (see below):
  - **Returns** *string*: notification ID
* **notifRetain()**: marks a notification as retained
  (it will not be automatically deleted, even if it's `sticky`):
  - **id** *string*: ID of the notification to be marked as retained
* **notifDelete()**: deletes a notification:
  - **id** *string*: ID of the notification to be deleted
* **notifDeleteByName()**: deletes a notification:
  - **name** *string*: name of the notification to be deleted
-- */
type NotificationStatePars = {
  ...$Exact<NotificationPars>,
  retained?: boolean,
};

type State = Array<NotificationStatePars>;

// ==========================================
// Store, reducer
// ==========================================
let store: Object;
function initStore() {
  const storeEnhancers = applyMiddleware(thunk);
  store = createStore(reducer, storeEnhancers);
}

const INITIAL_STATE: State = [];
const reducer: Reducer<State, Action> = (state0 = INITIAL_STATE, action) => {
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
};

// ==========================================
// Action creators
// ==========================================
let cntId = 0;
const DEFAULT_NOTIF_PARS = {
  name: '',
  retained: false,
  sticky: false,
  timeOut: 4000,
  type: undefined,
  icon: undefined,
  iconSpin: false,
  title: '',
  msg: '',
};
const actions = {
  notify: (initialPars: NotificationPars) => (dispatch: Function) => {
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
  notifRetain: (id: string) => ({ type: 'NOTIF_RETAIN', id }),
  notifDelete: (id: string) => ({ type: 'NOTIF_DELETE', id }),
  notifDeleteByName: (name: string) => ({ type: 'NOTIF_DELETE_BY_NAME', name }),
};

// Imperative dispatching
const notify = (initialPars: NotificationPars): string => {
  if (!store) initStore();
  const pars = store.dispatch(actions.notify(initialPars));
  return pars.id;
};
const notifRetain = (id: string) => {
  if (!store) initStore();
  store.dispatch(actions.notifRetain(id));
};
const notifDelete = (id: string) => {
  if (!store) initStore();
  store.dispatch(actions.notifDelete(id));
};
const notifDeleteByName = (name: string) => {
  if (!store) initStore();
  store.dispatch(actions.notifDeleteByName(name));
};

// ==========================================
// Notifications component
// ==========================================
type Props = {
  notifs?: ?State,
};

class Notifications extends React.PureComponent {
  props: Props;
  static defaultProps = { notifs: null };
  storeUnsubscribe: () => void;

  constructor(props: Props) {
    super(props);
    if (props.notifs == null) {
      if (!store) initStore();
      this.storeUnsubscribe = store.subscribe(this.forceUpdate.bind(this));
    }
  }

  componentWillUnmount() {
    if (this.storeUnsubscribe) this.storeUnsubscribe();
  }

  // ==========================================
  render() {
    const notifs = this.props.notifs || store.getState();
    return (
      <div className="giu-notifications" style={style.outer}>
        {notifs.map((props: NotificationStatePars) => (
          <Notification
            key={props.id}
            {...props}
            onHoverStart={this.onRetain}
            onHoverStop={this.onDismiss}
            onClick={this.onDismiss}
            noStylePosition={true}
          />
        ))}
      </div>
    );
  }

  // ==========================================
  onRetain = (ev: SyntheticEvent) => {
    if (!(ev.currentTarget instanceof Element)) return;
    store.dispatch(actions.notifRetain(ev.currentTarget.id));
  };
  onDismiss = (ev: SyntheticEvent) => {
    if (!(ev.currentTarget instanceof Element)) return;
    const { id } = ev.currentTarget;
    const notifs = this.props.notifs || store.getState();
    const notif = notifs.find(o => o.id === id);
    if (notif && notif.onClick) notif.onClick(ev);
    store.dispatch(actions.notifDelete(id));
  };
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
    zIndex: MISC.zNotif,
  },
};

// ==========================================
// Public API
// ==========================================
export {
  Notifications,
  reducer,
  actions,
  notify,
  notifRetain,
  notifDelete,
  notifDeleteByName,
};
