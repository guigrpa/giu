// @flow

/* eslint-disable no-unused-vars, no-undef */

// ========================================
// Libraries
// ========================================
// ----------------------------------------
// Moment
// ----------------------------------------
export type Moment = moment$Moment;

// ========================================
// Other
// ========================================
export type Choice = {|
  value: any,
  label?: string,
  keys?: Array<string>,
  onClick?: (ev: SyntheticEvent) => void,
|};

type CommandType = 'FOCUS' | 'BLUR' | 'REVERT';

export type Command = {|
  type: CommandType,
|};

export type Action = $Subtype<{ type: string }>;
