// @flow

/* eslint-disable no-unused-vars, no-undef */

// ========================================
// Libraries
// ========================================
// ----------------------------------------
// Moment
// ----------------------------------------
export type MomentT = moment$Moment;

// ========================================
// Other
// ========================================
export type ChoiceT = {|
  value: any,
  label?: string,
  keys?: Array<string>,
  onClick?: (ev: SyntheticEvent) => void,
|};

type CommandTypeT = 'FOCUS' | 'BLUR' | 'REVERT';

export type CommandT = {|
  type: CommandTypeT,
|};
