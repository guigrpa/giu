/* @flow */

/* eslint-disable no-undef */

import * as React from 'react';

// Ref: https://github.com/digiaonline/react-flow-types

export type ComponentWithDefaultProps<
  DefaultProps: {},
  Props: {}
> = React.ComponentType<Props> & { defaultProps: DefaultProps };

/**
 * Generic type for HOCs, which takes two type parameters:
 *
 * - RequiredProps: The final wrapped component will need RequiredProps, in addition to its own props
 * - ProvidedProps: The final wrapped component will not need ProvidedProps, because the HOC will provide them to the inner component
 */
export type Hoc<RequiredProps: {}, ProvidedProps: {}> =
  /* Hoc type 1 */
  (<OriginalProps, DefaultProps>(
    component: ComponentWithDefaultProps<DefaultProps, OriginalProps>
  ) => React.ComponentType<
    RequiredProps & $Diff<$Diff<OriginalProps, ProvidedProps>, DefaultProps>
  >) &
    /* Hoc type 2 */
    (<OriginalProps>(
      component: React.ComponentType<OriginalProps>
    ) => React.ComponentType<
      RequiredProps & $Diff<OriginalProps, ProvidedProps>
    >);
