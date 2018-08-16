// @flow

/* eslint-disable global-require */

import React from 'react';
import { addDefaults } from 'timm';
import { ThemeContext, DEFAULT_THEME } from '../gral/themeContext';
import { IS_IOS } from '../gral/constants';

// ==========================================
// Component
// ==========================================
// -- A root component that can be used for custom themes.
type Props = {
  themeId: string | Object,
  accentColor?: string,
  children: any,
};

const Giu = ({ themeId: id, accentColor, children }: Props) => {
  const theme = addDefaults({ id, accentColor }, DEFAULT_THEME);
  return (
    <ThemeContext.Provider value={theme}>
      {children}
      {IS_IOS ? IOS_STYLES : undefined}
    </ThemeContext.Provider>
  );
};

// ==========================================
const IOS_STYLES = (
  // Allows click events on Window (or non-anchor descendants)
  // to be detected by Giu components, e.g. to close floats
  <style jsx global>{`
    * {
      cursor: pointer;
    }
  `}</style>
);

// ==========================================
// Public
// ==========================================
export default Giu;
