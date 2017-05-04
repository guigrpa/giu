// @flow

// -- **ModalPars and ModalButton definitions:**
// --
// -- START_DOCS
export type ModalPars = {|
  id?: string,
  title?: string, // modal title displayed to the user
  children?: any, // body of the modal
  buttons?: Array<ModalButton>, // button objects (see below)

  // called when the backdrop
  // (semi-transparent layer highlighting the modal in fron of other
  // page contents) is clicked
  onClickBackdrop?: (ev: SyntheticMouseEvent) => void,

  onEsc?: (ev: SyntheticKeyboardEvent) => void, // called when ESC is pressed

  // merge with the modal's `div` style, e.g. to
  // fix a modal width or background color
  style?: Object,
  zIndex?: number,
|};

export type ModalButton = {|
  left?: boolean, // align button left instead of right (default: false)
  label?: any, // button text or other contents
  defaultButton?: boolean, // will be highlighted and automatically selected when RETURN is pressed
  onClick?: (ev: SyntheticEvent) => void, // `click` handler for the button
  style?: Object, // merged with the button's style
|};
// -- END_DOCS
