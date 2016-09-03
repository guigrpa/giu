import React                from 'react';
import { createStore }      from 'redux';
import {
  addLast,
  removeAt,
  set as timmSet,
}                           from 'timm';
import { MISC }             from '../gral/constants';
import Modal                from './modal';

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
      { label: 'Delete', onClick: deleteItem, style: { backgroundColor: 'red' } },
    ];
    modalPush({ children, buttons, onEsc: modalPop });
  }
}
```

API reference:

* **modalPush()**: creates a modal and pushes it on top of the stack:
  - **pars** *object*: modal parameters:
    * **title** *string?*: modal title displayed to the user
    * **children** *any?*: body of the modal
    * **buttons** *array(object)?*: button objects:
      - **left** *boolean? = false*: align button left instead of right
      - **label** *string*: button text
      - **onClick** *function*: `click` handler for the button
      - **defaultButton** *boolean?*: will be highlighted and
        automatically selected when RETURN is pressed
      - **style** *object?*: merge with the button's style
    * **onClickBackdrop** *function?*: called when the backdrop
      (semi-transparent layer highlighting the modal in fron of other
      page contents) is clicked
    * **onEsc** *function?*: called when ESC is pressed
    * **style** *object?*: merge with the modal's `div` style, e.g. to
      fix a modal width or background color
* **modalPop()**: removes the modal currently at the top of the stack
-- */

// ==========================================
// Store, reducer
// ==========================================
let store = null;
function initStore() { store = createStore(reducer); }

const INITIAL_STATE = [];
function reducer(state0 = INITIAL_STATE, action) {
  let state = state0;
  switch (action.type) {
    case 'MODAL_PUSH':
      state = addLast(state, action.pars);
      break;
    case 'MODAL_POP':
      state = removeAt(state, state.length - 1);
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
const actions = {
  modalPush: pars => ({
    type: 'MODAL_PUSH',
    pars: timmSet(pars, 'id', `modal_${cntId++}`),
  }),
  modalPop: () => ({ type: 'MODAL_POP' }),
};

// Imperative dispatching
const modalPush = pars => {
  const action = actions.modalPush(pars);
  store.dispatch(action);
  return action.pars.id;
};
const modalPop = () => store.dispatch(actions.modalPop());

// ==========================================
// Modals component
// ==========================================
class Modals extends React.PureComponent {
  static propTypes = {
    modals:                 React.PropTypes.array,
  };

  constructor(props) {
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

  componentWillUnmount() { if (this.storeUnsubscribe) this.storeUnsubscribe(); }

  // ==========================================
  render() {
    const modals = this.props.modals || store.getState();
    this.fPopped = (modals.length < this.prevModals.length);
    this.prevModals = modals;
    return (
      <div className="giu-modals">
        {modals.map((props, idx) =>
          <Modal key={props.id} ref={c => { this.refModals[idx] = c; }}
            zIndex={MISC.zModalBase + idx * MISC.zModalStep}
            {...props}
          />
        )}
      </div>
    );
  }
}

// ==========================================
// Public API
// ==========================================
const isModalActive = () => store.getState().length > 0;

export {
  Modals,
  reducer,
  actions,
  modalPush, modalPop, isModalActive,
};
