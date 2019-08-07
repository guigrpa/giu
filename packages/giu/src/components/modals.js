// @flow

/* eslint-disable no-plusplus */

import React from 'react';
import { createStore } from 'redux';
import type { Reducer } from 'redux';
import { addLast, removeAt, addDefaults } from 'timm';
import type { Action } from '../gral/types';
import Modal from './modal';
import type { ModalPars } from './modalTypes';

/* --
**Include the `<Modals />` component at (or near)
the root level of your React tree**. No props are required.

**Note on iOS usage**: on iOS, don't use Modals with embedded
inputs (TextInput, DateInput and so on).
Due to [these bugs](https://dzone.com/articles/issues-position-fixed),
when the user focuses on the embedded input, the whole page scrolls to the top.

Here's an example on how you would open and close a modal:

```js
import { modalPush, modalPop, Button } from 'giu';
class ModalExample extends React.Component {
  render() {
    return <Button onClick={() => this.deleteItem()}>Delete item</Button>
  }

  deleteItem() {
    const children = 'Are you sure you want to delete this item?';
    const deleteItem = () => { alert('deleted!'); modalPop(); }
    const buttons = [
      { label: 'Close', onClick: modalPop, defaultButton: true },
      { label: 'Delete', onClick: deleteItem },
    ];
    modalPush({ children, buttons, onEsc: modalPop });
  }
}
```

API reference:

* **modalPush()**: creates a modal and pushes it on top of the stack:
  - **pars** *ModalPars* (see Modal section)
* **modalPop()**: removes the modal currently at the top of the stack
-- */

type State = Array<ModalPars>;

// ==========================================
// Store, reducer
// ==========================================
let store: Object;
function initStore() {
  store = createStore(reducer);
}

const INITIAL_STATE: State = [];
const reducer: Reducer<State, Action> = (state0 = INITIAL_STATE, action) => {
  const state = state0;
  if (action.type === 'MODAL_PUSH') return addLast(state, action.pars);
  if (action.type === 'MODAL_POP') return removeAt(state, state.length - 1);
  return state;
};

// ==========================================
// Action creators
// ==========================================
let cntId = 0;
const actions = {
  modalPush: (initialPars: ModalPars) => {
    const id = `giu-modal-auto-${cntId}`;
    cntId += 1;
    const pars = addDefaults(initialPars, { id });
    return { type: 'MODAL_PUSH', pars };
  },
  modalPop: () => ({ type: 'MODAL_POP' }),
};

// Imperative dispatching
const modalPush = (pars: ModalPars) => {
  const action = actions.modalPush(pars);
  store.dispatch(action);
  return action.pars.id;
};
const modalPop = () => store.dispatch(actions.modalPop());

// ==========================================
// Modals component
// ==========================================
type Props = {
  modals?: State,
};

class Modals extends React.PureComponent<Props> {
  storeUnsubscribe: () => void;
  refModals: Array<any>;
  prevModals: State;
  fPopped: boolean;

  constructor(props: Props) {
    super(props);
    this.refModals = [];
    this.prevModals = [];
    if (props.modals == null) {
      if (!store) initStore();
      this.storeUnsubscribe = store.subscribe(this.forceUpdate.bind(this));
    }
  }

  // After popping a modal, focus on the top-most one
  componentDidUpdate() {
    if (this.fPopped) {
      const len = this.prevModals.length;
      if (len) this.refModals[len - 1].focus();
    }
  }

  componentWillUnmount() {
    if (this.storeUnsubscribe) this.storeUnsubscribe();
  }

  // ==========================================
  render() {
    const modals = this.props.modals || store.getState();
    this.fPopped = modals.length < this.prevModals.length;
    this.prevModals = modals;
    return (
      <div className="giu-modals">
        {modals.map((props, idx) => (
          <Modal
            key={props.id}
            ref={c => {
              this.refModals[idx] = c;
            }}
            {...props}
          />
        ))}
      </div>
    );
  }
}

// ==========================================
// Public
// ==========================================
const isModalActive = () => store.getState().length > 0;

export { Modals, reducer, actions, modalPush, modalPop, isModalActive };
