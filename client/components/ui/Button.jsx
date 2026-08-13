import Link from "next/link";

const variants = {
  primary:
    "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-primary bg-primary px-3 font-semibold text-inverse disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-default bg-surface px-3 font-semibold text-primary disabled:cursor-not-allowed disabled:opacity-50",
  text: "inline-flex items-center justify-center gap-1 border-0 bg-transparent font-semibold text-primary",
  icon: "relative grid size-9 place-items-center rounded-md border border-default bg-surface text-primary",
};

export default function Button({ href, variant = "primary", className = "", children, ...props }) {
  const classes = `${variants[variant] || variants.primary} ${className}`.trim();

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
