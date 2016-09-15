import React                from 'react';
import {
  createStore,
  applyMiddleware,
}                           from 'redux';
import thunk                from 'redux-thunk';
import {
  merge,
  updateIn,
  set as timmSet,
}                           from 'timm';
import HintScreen           from './hintScreen';
import { localGet, localSet } from '../gral/storage';

/* --
**Include the `<Hints />` component at (or near)
the root level of your React tree**. No props are required.
Here's an example on how you would define a hint screen and show it
afterwards:

```js
import { hintShow, Button } from 'giu';
class HintExample extends React.Component {
  componentWillMount() {
    hintDefine('hintExample', {
      elements: [
        {
          type: 'LABEL', x: 200, y: 50,
          children: <span>A label with an icon <Icon icon="ambulance" /></span>,
        },
        { type: 'ARROW', from: { x: 200, y: 50 }, to: { x: 50, y: 50 }, counterclockwise: true }
      ],
    });
  }

  render() {
    <Button onClick={() => hintShow('hintExample')}>Show hint</Button>
  }
}
```

The first time you click on the button, the hint screen will appear.
After that, the `hintExample` screen will be disabled (unless `hintReset()`
is called or the `force` argument of `hintShow()` is used, see below).
The list of disabled hint screens is stored in LocalStorage.

API reference:

* **hintDefine()**: defines a hint screen:
  - **id** *string*: ID of the hint to be created
  - **pars** *object*: hint parameters:
    + **elements** *array(object)|function?*: either an array of elements,
      or a function returning such an element (for dynamic positioning).
      Elements have these attributes:
      - **type** *string(`LABEL` | `ARROW`)*
      - Arrows:
        - **from** *object*: coordinates, e.g. `{ x: 5, y: 10 }`
        - **to** *object*: coordinates
        - **counterclockwise** *boolean*
      - Labels:
        - **x** and **y** *number*: coordinates
        - **align** *string(`left` | `center` | `right`)? = `left`*
        - **children** *any*: React elements that comprise the label
    + **closeLabel** *string? = `Got it!`*: label of the close button
    + **onClose** *function?*: called when the hint screen is closed
* **hintDisableAll()**: disables all hints
* **hintReset()**: clears the list of disabled hints
* **hintShow()**: shows a hint
  - **id** *string*: ID of the hint to be shown
  - **force** *boolean?*: if not enabled, the hint will only be shown if
    hints are enabled (no previous call to `hintDisableAll()` and it has not
    already been shown)
* **hintHide()**: hides the currently shown hint, if any
-- */

// ==========================================
// Store, reducer
// ==========================================
let store = null;

const INITIAL_STATE = {
  fDisableAll: false,
  disabled: [],
  shown: null,
  catalogue: {},
};

function initStore() {
  const storeEnhancers = applyMiddleware(thunk);
  const initialState = merge({}, INITIAL_STATE);
  try {
    initialState.fDisableAll = localGet('hints.fDisableAll');
  } catch (err) { /* discard */ }
  try {
    initialState.disabled = localGet('hints.disabled');
  } catch (err) { /* discard */ }
  store = createStore(reducer, initialState, storeEnhancers);
}

function reducer(state0 = INITIAL_STATE, action) {
  let state = state0;
  let id;
  switch (action.type) {
    case 'HINT_DEFINE':
      state = updateIn(state, ['catalogue'], catalogue =>
        timmSet(catalogue, action.id, action.pars));
      break;
    case 'HINT_DISABLE_ALL':
      state = timmSet(state, 'fDisableAll', true);
      state = timmSet(state, 'shown', null);
      break;
    case 'HINT_RESET':
      state = merge(state, {
        fDisableAll: false,
        disabled: [],
      });
      break;
    case 'HINT_SHOW':
      id = action.id;
      if (action.force ||
          (!state.fDisableAll && state.disabled.indexOf(id) < 0)) {
        state = timmSet(state, 'shown', id);
        if (state.disabled.indexOf(id) < 0) {
          state = timmSet(state, 'disabled', state.disabled.concat(id));
        }
      }
      break;
    case 'HINT_HIDE':
      state = timmSet(state, 'shown', null);
      break;
    default:
      break;
  }
  return state;
}

// ==========================================
// Action creators
// ==========================================
const actions = {
  hintDefine: (id, pars) => ({ type: 'HINT_DEFINE', id, pars }),
  hintDisableAll: () => (dispatch, getState) => {
    dispatch({ type: 'HINT_DISABLE_ALL' });
    const { fDisableAll } = getState();
    localSet('hints.fDisableAll', fDisableAll);
  },
  hintReset: () => (dispatch, getState) => {
    dispatch({ type: 'HINT_RESET' });
    const { fDisableAll, disabled } = getState();
    localSet('hints.fDisableAll', fDisableAll);
    localSet('hints.disabled', disabled);
  },
  hintShow: (id, force) => (dispatch, getState) => {
    dispatch({ type: 'HINT_SHOW', id, force });
    const { disabled } = getState();
    localSet('hints.disabled', disabled);
  },
  hintHide: () => ({ type: 'HINT_HIDE' }),
};

// Imperative dispatching
const hintDefine = (id, pars) => store.dispatch(actions.hintDefine(id, pars));
const hintDisableAll = () => store.dispatch(actions.hintDisableAll());
const hintReset = () => store.dispatch(actions.hintReset());
const hintShow = (id, force) => store.dispatch(actions.hintShow(id, force));
const hintHide = () => store.dispatch(actions.hintHide());

// ==========================================
// Hints component
// ==========================================
class Hints extends React.PureComponent {
  static propTypes = {
    storeState:             React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    if (props.storeState == null) {
      if (!store) initStore();
      this.storeUnsubscribe = store.subscribe(this.forceUpdate.bind(this));
    }
  }

  componentWillUnmount() { if (this.storeUnsubscribe) this.storeUnsubscribe(); }

  // ==========================================
  render() {
    this.storeState = this.props.storeState || store.getState();
    return (
      <div className="giu-hints">
        {this.renderHint()}
      </div>
    );
  }

  renderHint() {
    const { shown, catalogue } = this.storeState;
    if (!shown) return null;
    const pars = catalogue[shown];
    return <HintScreen {...pars} onClose={hintHide} />;
  }
}

// ==========================================
// Public API
// ==========================================
const isHintShown = () => store.getState().shown != null;

export {
  Hints,
  reducer,
  actions,
  hintDefine, hintDisableAll, hintReset, hintShow, hintHide, isHintShown,
};
