import type { SVGProps } from 'react';

const UserIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg fill="none" height="1em" stroke="foreground" viewBox="0 0 18 18" width="1em" {...props}>
    <circle cx={9} cy={4.5} r={3} />
    <path d="M15 13.125c0 1.864 0 3.375-6 3.375s-6-1.511-6-3.375S5.686 9.75 9 9.75s6 1.511 6 3.375Z" />
  </svg>
);

export default UserIcon;
