// @flow

import React from 'react';
import Notification from '../components/notification';
import Checkbox from '../inputs/checkbox';

export const a = () => <Checkbox />;
// $FlowFixMe
export const a2 = () => <Checkbox disabled={3} />;
// $FlowFixMe
export const a3 = () => <Checkbox id={3} />;

export const b = () => <Notification />;
// $FlowFixMe
export const b2 = () => <Notification icon={3} />;
