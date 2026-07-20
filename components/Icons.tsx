import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Base({ size = 24, children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export function ArchiveIcon(props: IconProps) {
  return <Base {...props}><path d="M4 8.2h16v11.3H4zM3 4.5h18v3.7H3zM9 12h6" stroke="currentColor" strokeWidth="1.5"/><path d="M6 4.5 7.3 2.8h9.4L18 4.5" stroke="currentColor" strokeWidth="1.5"/></Base>;
}
export function ArrowIcon(props: IconProps) {
  return <Base {...props}><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square"/></Base>;
}
export function SearchIcon(props: IconProps) {
  return <Base {...props}><circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="1.5"/><path d="m15 15 5 5" stroke="currentColor" strokeWidth="1.5"/></Base>;
}
export function ClockIcon(props: IconProps) {
  return <Base {...props}><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5"/><path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.5"/></Base>;
}
export function PeopleIcon(props: IconProps) {
  return <Base {...props}><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/><circle cx="17" cy="9.5" r="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3.5 19c.3-4 2.1-6 5.5-6s5.2 2 5.5 6M14 14.5c3.8-.4 5.7 1.1 6 4.5" stroke="currentColor" strokeWidth="1.5"/></Base>;
}
export function UserIcon(props: IconProps) {
  return <Base {...props}><circle cx="12" cy="8.5" r="3.5" stroke="currentColor" strokeWidth="1.5"/><path d="M5.5 19.5v-1a4 4 0 0 1 4-4h5a4 4 0 0 1 4 4v1" stroke="currentColor" strokeWidth="1.5"/></Base>;
}
export function TargetIcon(props: IconProps) {
  return <Base {...props}><circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.5"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/></Base>;
}
export function MapPinIcon(props: IconProps) {
  return <Base {...props}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/><circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/></Base>;
}
export function ActivityIcon(props: IconProps) {
  return <Base {...props}><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></Base>;
}
export function LabelIcon(props: IconProps) {
  return <Base {...props}><path d="M19 12l-5-5H4v10h10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></Base>;
}
export function LayersIcon(props: IconProps) {
  return <Base {...props}><path d="m12 3 9 5-9 5-9-5 9-5Z" stroke="currentColor" strokeWidth="1.5"/><path d="m5 12 7 4 7-4M5 16l7 4 7-4" stroke="currentColor" strokeWidth="1.5"/></Base>;
}
export function LightIcon(props: IconProps) {
  return <Base {...props}><path d="M9 16.5h6M9.5 20h5" stroke="currentColor" strokeWidth="1.5"/><path d="M8.3 14.5C6.9 13.3 6 11.6 6 9.7a6 6 0 0 1 12 0c0 1.9-.9 3.6-2.3 4.8-.5.4-.7.8-.7 1.5H9c0-.7-.2-1.1-.7-1.5Z" stroke="currentColor" strokeWidth="1.5"/></Base>;
}
export function MenuIcon(props: IconProps) {
  return <Base {...props}><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5"/></Base>;
}
export function CloseIcon(props: IconProps) {
  return <Base {...props}><path d="m5 5 14 14M19 5 5 19" stroke="currentColor" strokeWidth="1.5"/></Base>;
}
export function DownloadIcon(props: IconProps) {
  return <Base {...props}><path d="M12 3v12M7.5 10.5 12 15l4.5-4.5M4 20h16" stroke="currentColor" strokeWidth="1.5"/></Base>;
}
export function LockIcon(props: IconProps) {
  return <Base {...props}><rect x="5" y="10" width="14" height="11" stroke="currentColor" strokeWidth="1.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" stroke="currentColor" strokeWidth="1.5"/></Base>;
}
export function PlusIcon(props: IconProps) {
  return <Base {...props}><path d="M12 4v16M4 12h16" stroke="currentColor" strokeWidth="1.5"/></Base>;
}
export function TrashIcon(props: IconProps) {
  return <Base {...props}><path d="M4 7h16M9 3h6l1 4M7 7l1 14h8l1-14M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.5"/></Base>;
}
export function PanelLeftIcon(props: IconProps) {
  return <Base {...props}><rect x="3.5" y="4" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M3.5 4h5.5v16h-5.5z" fill="currentColor" opacity="0.2"/><path d="M9 4v16M6.5 9.5 4.8 12l1.7 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></Base>;
}
export function PanelRightIcon(props: IconProps) {
  return <Base {...props}><rect x="3.5" y="4" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M15 4h5.5v16h-5.5z" fill="currentColor" opacity="0.2"/><path d="M15 4v16m2.5-10.5 1.7 2.5-1.7 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></Base>;
}
export function VideoIcon(props: IconProps) {
  return <Base {...props}><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="m10 9 5 3-5 3V9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></Base>;
}
export function ImageIcon(props: IconProps) {
  return <Base {...props}><rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.5"/><path d="m5 18 5-5 3 3 2-2 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></Base>;
}
export function ToggleIcon(props: IconProps) {
  return <Base {...props}><path d="m5 8 3 3-3 3M11 8h8M11 12h8M11 16h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></Base>;
}
export function FocusIcon(props: IconProps) {
  return <Base {...props}><path d="M8 4H4v4M16 4h4v4M8 20H4v-4M16 20h4v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 9h6v6H9z" stroke="currentColor" strokeWidth="1.5"/></Base>;
}

export function PanelLeftOpenIcon(props: IconProps) {
  return <Base {...props}><rect x="3.5" y="4" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3"/><path d="M9 4v16M4.8 9.5 6.5 12l-1.7 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></Base>;
}

export function PanelRightOpenIcon(props: IconProps) {
  return <Base {...props}><rect x="3.5" y="4" width="17" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3"/><path d="M15 4v16m4.2-10.5-1.7 2.5 1.7 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></Base>;
}


