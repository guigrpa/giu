// @flow

/* eslint-disable global-require */

import React from 'react';
import { addDefaults } from 'timm';
import { ThemeContext, DEFAULT_THEME } from '../gral/themeContext';

// ==========================================
// Component
// ==========================================
// -- A root component that can be used for custom themes.
type Props = {
  themeId?: string | Object,
  children: any,
};

const Giu = ({ themeId: id, children }: Props) => {
  let theme = { id };
  theme = addDefaults(theme, DEFAULT_THEME);
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

// ==========================================
// Public
// ==========================================
export default Giu;
