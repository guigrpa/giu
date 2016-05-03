import React                from 'react';
import PureRenderMixin      from 'react-addons-pure-render-mixin';
import { scrollIntoView }   from '../gral/visibility';
import input                from '../hocs/input';
import hoverable            from '../hocs/hoverable';
import FocusCapture         from '../components/focusCapture';

// ==========================================
// Component
// ==========================================
class DatePicker extends React.Component {
}

// ==========================================
// Public API
// ==========================================
export default input(hoverable(DatePicker));
