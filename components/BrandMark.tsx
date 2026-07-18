import type { SVGProps } from "react";

type BrandMarkProps = Omit<SVGProps<SVGSVGElement>, "width" | "height"> & {
  size?: number;
  variant?: "brand" | "mono" | "reverse";
  title?: string;
};

/**
 * Relay Folio — two open editorial surfaces joined by one ascending handoff.
 * Keep the geometry unchanged so the 16px favicon and large lockups share one silhouette.
 */
export function BrandMark({ size = 24, variant = "brand", title, className = "", ...props }: BrandMarkProps) {
  const singleColor = variant === "mono" || variant === "reverse";
  const accessible = Boolean(title);

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      role={accessible ? "img" : undefined}
      aria-hidden={accessible ? undefined : true}
      aria-label={accessible ? title : undefined}
      className={`relay-folio-mark ${singleColor ? "is-monochrome" : "is-brand"} ${className}`.trim()}
      {...props}
    >
      <path className="relay-frame relay-frame-left" d="M10 4H5.8Q4 4 4 5.8V18.2Q4 20 5.8 20H10" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" strokeLinejoin="round"/>
      <path className="relay-frame relay-frame-right" d="M14 4H18.2Q20 4 20 5.8V18.2Q20 20 18.2 20H14" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" strokeLinejoin="round"/>
      <path className="relay-bridge" d="M9 15 15 9" stroke={singleColor ? "currentColor" : "#D61F3C"} strokeWidth="2.4" strokeLinecap="round"/>
    </svg>
  );
}
