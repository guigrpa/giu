// @no-flow

import * as React from 'react';
import Notification from '../components/notification';
// import Checkbox from '../inputs/checkbox';

// export const a = () => <Checkbox />;
// // $FlowFixMe
// export const a2 = () => <Checkbox disabled={3} />;
// // $FlowFixMe
// export const a3 = () => <Checkbox id={3} />;
// export const a4 = () => <Checkbox pepinillo={3} />;
// export const a5 = () => <Checkbox onChange={() => {}} />;
// // $FlowFixMe
// export const a6 = () => <Checkbox onChange={4} />;

export const b = () => <Notification />;
export const b1 = () => <Notification onHoverStart={() => {}} />;
// $FlowFixMe
export const b2 = () => <Notification icon={3} />;
// $FlowFixMe
export const b3 = () => <Notification onHoverStart={3} />;
