import type { ReactNode, SVGProps } from "react";

type IconName =
  | "dashboard"
  | "units"
  | "settings"
  | "search"
  | "bell"
  | "help"
  | "chevron"
  | "menu"
  | "truck"
  | "edit"
  | "plus"
  | "left"
  | "right";

type IconProps = SVGProps<SVGSVGElement> & { name: IconName };

export function Icon({ name, ...props }: IconProps) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 1.7,
  };
  const paths: Record<IconName, ReactNode> = {
    dashboard: (
      <>
        <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
        <rect x="13.5" y="3.5" width="7" height="4" rx="1.2" />
        <rect x="13.5" y="10.5" width="7" height="10" rx="1.2" />
        <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
      </>
    ),
    units: (
      <>
        <path d="M3.5 20.5h17M5.5 20V5.4a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1V20M8.5 8h2m3 0h2m-7 4h2m3 0h2m-7 4h2m3 0h2" />
        <path d="M10 20v-3h4v3" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path
          d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 0 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 0 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 0 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z"
          transform="translate(-.2 1) scale(.96)"
        />
      </>
    ),
    search: (
      <>
        <circle cx="10.8" cy="10.8" r="6.4" />
        <path d="m16 16 4.2 4.2" />
      </>
    ),
    bell: (
      <>
        <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-8 12h4" />
      </>
    ),
    help: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.7 9a2.4 2.4 0 1 1 4.3 1.5c-.9 1-2 1.3-2 2.8m0 3h.01" />
      </>
    ),
    chevron: <path d="m7 9 5 5 5-5" />,
    menu: (
      <>
        <path d="M4 6h16M4 12h16M4 18h16" />
      </>
    ),
    truck: (
      <>
        <path d="M2.5 7h12v10h-12zM14.5 10h4l3 3v4h-7z" />
        <circle cx="7" cy="18" r="1.7" />
        <circle cx="18" cy="18" r="1.7" />
      </>
    ),
    edit: (
      <>
        <path d="m14 5 5 5M4 20l4-.8L19.2 8a2.1 2.1 0 0 0-3-3L5 16.2 4 20Z" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14M5 12h14" />
      </>
    ),
    left: (
      <>
        <path d="M19 12H5m7 7-7-7 7-7" />
      </>
    ),
    right: (
      <>
        <path d="M5 12h14m-7-7 7 7-7 7" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      {...common}
      {...props}>
      {paths[name]}
    </svg>
  );
}
