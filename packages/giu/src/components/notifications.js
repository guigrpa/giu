// @flow

/* eslint-disable no-plusplus */

import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import type { Reducer } from 'redux';
import thunk from 'redux-thunk';
import { updateIn, addLast, removeAt, addDefaults } from 'timm';
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
  if (action.type === 'NOTIFY') {
    return addLast(state, action.pars);
  }
  if (action.type === 'NOTIF_RETAIN') {
    const { id } = action;
    const idx = state.findIndex(o => o.id === id);
    if (idx >= 0) state = updateIn(state, [idx, 'retained'], () => true);
    return state;
  }
  if (action.type === 'NOTIF_DELETE') {
    const { id } = action;
    const idx = state.findIndex(o => o.id === id);
    if (idx >= 0 && !(action.fAuto && state[idx].retained)) {
      state = removeAt(state, idx);
    }
    return state;
  }
  return state;
};

// ==========================================
// Action creators
// ==========================================
let cntId = 0;
const DEFAULT_NOTIF_PARS = {
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
    const id = `giu-notif-auto-${cntId}`;
    cntId += 1;
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

// ==========================================
// Notifications component
// ==========================================
type Props = {
  notifs?: ?State,
};

class Notifications extends React.PureComponent<Props> {
  storeUnsubscribe: () => void;

  static defaultProps = { notifs: null };

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
      <div className="giu-notifications">
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
  onRetain = (ev: SyntheticEvent<*>) => {
    if (!(ev.currentTarget instanceof Element)) return;
    store.dispatch(actions.notifRetain(ev.currentTarget.id));
  };
  onDismiss = (ev: SyntheticEvent<*>) => {
    if (!(ev.currentTarget instanceof Element)) return;
    const { id } = ev.currentTarget;
    const notifs = this.props.notifs || store.getState();
    const notif = notifs.find(o => o.id === id);
    if (notif && notif.onClick) notif.onClick(ev);
    store.dispatch(actions.notifDelete(id));
  };
}

// ==========================================
// Public
// ==========================================
export { Notifications, reducer, actions, notify, notifRetain, notifDelete };
