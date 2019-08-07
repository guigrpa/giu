// @flow

import React from 'react';

// ==========================================
// Component
// ==========================================
/* --
A simple `div` showing a centered message with a large font size.
Ideal for *No matches found*, *Choose one of the options above*,
that kind of thing. Props:
-- */
// -- START_DOCS
type Props = {
  children?: any, // contents to be shown
};
// -- END_DOCS

const LargeMessage = ({ children }: Props) => (
  <div className="giu-large-message">{children}</div>
);

// ==========================================
// Public
// ==========================================
export default LargeMessage;
