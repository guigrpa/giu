// @flow

import React from 'react';
import { COLORS } from './constants';

export type Theme = {
  id: string,
  accentColor: string,
};

const DEFAULT_THEME: Theme = {
  id: 'default',
  accentColor: COLORS.accent,
};

const ThemeContext = React.createContext(DEFAULT_THEME);

// ==========================================
// Public
// ==========================================
export { DEFAULT_THEME, ThemeContext };
