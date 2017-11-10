import React from 'react';
import Link from 'next/link';

// ================================================
// Public
// ================================================
class AppWrapper extends React.Component {
  render() {
    return (
      <div>
        <Link href="/giu/play2">
          <a>Play2</a>
        </Link>
      </div>
    );
  }
}

export default AppWrapper;
