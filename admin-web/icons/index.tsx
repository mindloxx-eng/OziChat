import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

const base = (props: IconProps): IconProps => ({
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  viewBox: '0 0 24 24',
  ...props,
});

export const DashboardIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="7" height="9" rx="2" />
    <rect x="14" y="3" width="7" height="5" rx="2" />
    <rect x="14" y="12" width="7" height="9" rx="2" />
    <rect x="3" y="16" width="7" height="5" rx="2" />
  </svg>
);

export const UsersIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.6-3.5 3.4-5.5 6.5-5.5s5.9 2 6.5 5.5" />
    <circle cx="17" cy="9" r="2.8" />
    <path d="M15.5 14.6c2.8.4 4.8 2.3 5.5 5.4" />
  </svg>
);

export const SettingsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

export const LogoutIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="M16 17l5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);

export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const BellIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M18 16V11a6 6 0 0 0-12 0v5l-2 3h16z" />
    <path d="M10 21a2 2 0 0 0 4 0" />
  </svg>
);

export const TrendUpIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 17 10 11l4 4 6-7" />
    <path d="M14 8h6v6" />
  </svg>
);

export const TrendDownIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7 10 13l4-4 6 7" />
    <path d="M14 16h6v-6" />
  </svg>
);

export const ShieldIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3 4 6v6c0 4.5 3.4 8.5 8 9 4.6-.5 8-4.5 8-9V6l-8-3z" />
  </svg>
);

export const CheckIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m5 12 5 5 9-11" />
  </svg>
);

export const XIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12" />
    <path d="M18 6 6 18" />
  </svg>
);

export const BanIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="m6 6 12 12" />
  </svg>
);

export const DotsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="5" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="19" cy="12" r="1.6" />
  </svg>
);

export const LockIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

export const MailIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m4 7 8 6 8-6" />
  </svg>
);

export const SunIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);

export const ChipIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="5" y="5" width="14" height="14" rx="2" />
    <rect x="9" y="9" width="6" height="6" rx="1" />
    <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
  </svg>
);

export const ChatIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21 11.5a8.4 8.4 0 0 1-1 4 8.5 8.5 0 0 1-7.6 4.5 8.4 8.4 0 0 1-4-1L3 21l2-5.4a8.4 8.4 0 0 1-1-4 8.5 8.5 0 0 1 4.5-7.6 8.4 8.4 0 0 1 4-1h.5a8.5 8.5 0 0 1 8 8z" />
  </svg>
);

export const VideoIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="14" height="14" rx="2.5" />
    <path d="m17 10 4-2v8l-4-2z" />
  </svg>
);

export const MapIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2-6-2z" />
    <path d="M9 3v16" />
    <path d="M15 5v16" />
  </svg>
);

export const PinIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 21s-7-7-7-12a7 7 0 0 1 14 0c0 5-7 12-7 12z" />
    <circle cx="12" cy="9" r="2.4" />
  </svg>
);

export const TrashIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 6h18" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M10 11v6M14 11v6" />
  </svg>
);

export const EyeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const HeartIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20.8 6.3a5.5 5.5 0 0 0-9-1.8L12 5.3l-.2-.3a5.5 5.5 0 0 0-9 7l9.2 9 9.2-9a5.5 5.5 0 0 0-.4-5.7z" />
  </svg>
);

export const GroupIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="9" cy="9" r="3.2" />
    <path d="M2.5 19c.6-3.2 3.4-5 6.5-5s5.9 1.8 6.5 5" />
    <circle cx="17.5" cy="7.5" r="2.4" />
    <path d="M16 13c2.5.4 4.4 2 5 5" />
  </svg>
);

export const HashIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 9h14M5 15h14M10 3 8 21M16 3l-2 18" />
  </svg>
);

export const FlagIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 21V4" />
    <path d="M4 4h13l-2 4 2 4H4" />
  </svg>
);

export { LogoIcon as OziLogoMark } from '../../components/icons/LogoIcon';
export { OzichatLogo as OziWordmark } from '../../components/icons/NestfingerLogo';
