import React from 'react';
import Link from 'next/link';
import 'giu/lib/css/reset.css';
import 'giu/lib/css/giu.css';
import 'giu/lib/css/colorInput.css';

// ================================================
// Public
// ================================================
class AppWrapper extends React.Component {
  render() {
    return (
      <div>
        <Link href="/play2">
          <a>Play2</a>
        </Link>
      </div>
    );
  }
}

export default AppWrapper;
