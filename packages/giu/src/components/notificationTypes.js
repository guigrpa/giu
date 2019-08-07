// @flow

/* --
**`NotificationPars` definition:**
-- */
/* -- START_DOCS -- */
export type NotificationType = 'info' | 'success' | 'warn' | 'error';
export type NotificationPars = {|
  id?: string,
  sticky?: boolean, // never delete this notification
  timeOut?: number, // time [ms] after which it's deleted [default: 4000]
  type?: NotificationType, // default: `info`
  icon?: string, // default: `exclamation`
  iconSpin?: boolean,
  title?: string, // highlighted text at the top of the notification
  msg?: string, // notification text
  onClick?: (ev: SyntheticEvent<*>) => any, // `click` handler
  noStylePosition?: boolean,
  noStyleShadow?: boolean,
|};
/* -- END_DOCS -- */
