// @flow

/* eslint-disable no-unused-vars, no-undef */

// ========================================
// Libraries
// ========================================
// ----------------------------------------
// Moment
// ----------------------------------------
export type Moment = any;

// ========================================
// Keys
// ========================================
export type KeyboardModifiers = {|
  altKey: boolean,
  metaKey: boolean,
  ctrlKey: boolean,
  shiftKey: boolean,
|};

export type KeyboardEventPars = {
  ...KeyboardModifiers,
  keyCode: number,
  which: number,
};

export type KeyboardShortcut = {
  ...KeyboardModifiers,
  keyCodes: Array<number>,
  keyNames: Array<string>,
  hash: string,
  description: string,
};

// ========================================
// Other
// ========================================
export type Choice = {
  value: any,
  label?: string | ((lang: ?string) => any),
  keys?: string | Array<string>,
  onClick?: (ev: SyntheticEvent) => any,
  shortcuts?: Array<KeyboardShortcut>,
};

type CommandType = 'FOCUS' | 'BLUR' | 'REVERT';

export type Command = {|
  type: CommandType,
|};

export type Action = { type: string };

export type StatelessComponent<P> = (props: P) => ?React$Element<any>;
