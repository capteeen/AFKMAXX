'use client';

import { useEffect } from 'react';

export function DesktopReturn() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.href = 'afkmaxx://connected';
    }, 400);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <a className="button lime" href="afkmaxx://connected">
      Return to AFKMAXX <span>↗</span>
    </a>
  );
}
