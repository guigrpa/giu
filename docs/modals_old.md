There are two straightforward ways to create modals:

* *[Recommended]* Embedding **Modal** in another component: this is the most React-conformant, conceptually simple, suitable for most cases.
* Using the standalone **Modals** component: supports stacked modals. In addition, you could extract its (Redux) reducer and action creators and integrate them in your own Redux implementation.

*Note: an embedded `Modal` in a component with `translateZ(0)` or similar (which creates a stacking context and a containing block) will not be properly positioned and may even be cropped. In such a case, use `Modals` instead.*
