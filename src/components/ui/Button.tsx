import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "outline" | "ghost" | "whatsapp";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight " +
  "transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 " +
  "focus-visible:ring-morado/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink " +
  "disabled:opacity-50 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary:
    "text-white bg-gradient-to-r from-morado to-naranja shadow-lg shadow-morado/25 " +
    "hover:shadow-xl hover:shadow-morado/40 hover:-translate-y-0.5",
  outline:
    "text-cloud border border-line bg-white/[0.02] backdrop-blur " +
    "hover:border-morado/60 hover:bg-white/[0.05] hover:-translate-y-0.5",
  ghost: "text-mist hover:text-cloud hover:bg-white/[0.05]",
  whatsapp:
    "text-white bg-[#25D366] shadow-lg shadow-[#25D366]/25 " +
    "hover:brightness-110 hover:shadow-xl hover:shadow-[#25D366]/40 hover:-translate-y-0.5",
};

const sizes: Record<Size, string> = {
  sm: "text-sm px-4 py-2",
  md: "text-sm px-6 py-3",
  lg: "text-base px-8 py-4",
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = CommonProps &
  Omit<ComponentProps<"button">, "className" | "children"> & { href?: undefined };
type ButtonAsLink = CommonProps &
  Omit<ComponentProps<typeof Link>, "className" | "children" | "href"> & { href: string; external?: boolean };

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = "primary", size = "md", className, children } = props;
  const classes = cn(base, variants[variant], sizes[size], className);

  if ("href" in props && props.href) {
    const { href, external, variant: _v, size: _s, className: _c, children: _ch, ...rest } = props as ButtonAsLink;
    if (external) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={classes} {...(rest as ComponentProps<"a">)}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const { variant: _v, size: _s, className: _c, children: _ch, href: _h, ...rest } = props as ButtonAsButton & {
    href?: undefined;
  };
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
