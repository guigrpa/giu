// @flow

import React from 'react';

export type Theme = {
  id: string,
};

const DEFAULT_THEME: Theme = {
  id: 'default',
};

const ThemeContext: any = React.createContext(DEFAULT_THEME);

// ==========================================
// Public
// ==========================================
export { DEFAULT_THEME, ThemeContext };
