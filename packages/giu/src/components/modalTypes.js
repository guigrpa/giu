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
  onClickBackdrop?: (ev: SyntheticMouseEvent<>) => any,

  onEsc?: (ev: SyntheticKeyboardEvent<>) => any, // called when ESC is pressed

  // merge with the modal's `div` style, e.g. to
  // fix a modal width or background color
  style?: Object,
  zIndex?: number,
|};

export type ModalButton = {|
  left?: boolean, // align button left instead of right (default: false)
  label?: any, // button text or other contents
  disabled?: boolean,
  defaultButton?: boolean, // will be highlighted and automatically selected when RETURN is pressed
  onClick?: (ev: SyntheticEvent<>) => any, // `click` handler for the button
  style?: Object, // merged with the button's style
  accent?: boolean, // accent style (use it with MDL theme)
|};
// -- END_DOCS
