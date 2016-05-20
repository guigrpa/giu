import React                from 'react';
import {
  vectorAdd as add,
  vectorSub as sub,
  vectorMult as mult,
  vectorRotate as rotate,
  vectorNormalize as normalize,
  degToRad,
}                           from '../gral/math';

const vec = V => `${V.x},${V.y}`;

// ==========================================
// Component
// ==========================================
class HintArrow extends React.Component {
  static propTypes = {
    from:                   React.PropTypes.object.isRequired,
    to:                     React.PropTypes.object.isRequired,
    curveFactor:            React.PropTypes.number,
    arrowSize:              React.PropTypes.number,
    arrowAngle:             React.PropTypes.number,
    counterclockwise:       React.PropTypes.bool,
  };
  static defaultProps = {
    curveFactor:            0.7,  // 0.6...2
    arrowSize:              10,
    arrowAngle:             30,
  };

  // ==========================================
  // Render
  // ==========================================
  render() {
    const {
      from: A, to: B,
      curveFactor,
      arrowSize, arrowAngle,
      counterclockwise,
    } = this.props;

    // From, to
    let d = [`M${vec(A)}`];

    // Arrow line (T is the reference point for the curve; Ta and Tb are the Bézier handles)
    const AB = sub(B, A);
    const AX = mult(AB, 0.5);
    const X = add(A, AX);
    const alpha1 = counterclockwise ? Math.PI / 2 : -Math.PI / 2;
    const XT = rotate(AX, alpha1);
    const T = add(X, XT);
    const AT = sub(T, A);
    const BT = sub(T, B);
    const Ta = add(A, mult(AT, curveFactor));
    const Tb = add(B, mult(BT, curveFactor));
    // d.push "M#{vec(A)} L#{vec(Ta)}"
    // d.push "M#{vec(B)} L#{vec(Tb)}"
    // d.push "M#{vec(A)}"
    d.push(`C${vec(Ta)},${vec(Tb)},${vec(B)}`);

    // Arrow head (R is the direction opposite to the arrow direction)
    const BR = mult(normalize(BT), arrowSize);
    // BRcorrection = Math.PI / 4 * (1 - curveFactor)
    // BR = _rotate BR, -BRcorrection
    const alpha2 = degToRad(arrowAngle);
    const BR1 = rotate(BR, alpha2);
    const BR2 = rotate(BR, -alpha2);
    d.push(`M${vec(B)} l${vec(BR1)}`);
    d.push(`M${vec(B)} l${vec(BR2)}`);

    // Final path
    d = d.join(' ');
    return <path className="giu-hint-arrow" d={d} />;
  }
}

// ==========================================
// Public API
// ==========================================
export default HintArrow;
