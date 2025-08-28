import * as React from 'react';

export const Logo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <title>RareFind AI Logo</title>
    <path d="M4 14.899A7 7 0 1 1 15 9.1" />
    <path d="M15 9.1A7 7 0 1 0 4 14.899" />
    <path d="M12 12h.01" />
    <path d="M12 5h.01" />
    <path d="M12 19h.01" />
    <path d="M9 9h.01" />
    <path d="M15 15h.01" />
  </svg>
);
