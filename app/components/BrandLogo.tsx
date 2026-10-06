type BrandLogoProps = {
  variant?: "horizontal" | "wordmark";
  tone?: "auto" | "night";
  className?: string;
};

const sizes = {
  horizontal: { width: 892, height: 256 },
  wordmark: { width: 791, height: 132 },
};

export function BrandLogo({ variant = "horizontal", tone = "auto", className }: BrandLogoProps) {
  const { width, height } = sizes[variant];
  const classes = `brand-logo brand-logo-${variant}${className ? ` ${className}` : ""}`;

  if (tone === "night") {
    return (
      <span className={classes}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/brand/${variant}-noche.svg`} alt="" width={width} height={height} />
      </span>
    );
  }

  return (
    <span className={classes}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="brand-logo-light" src={`/brand/${variant}-color.svg`} alt="" width={width} height={height} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="brand-logo-dark" src={`/brand/${variant}-noche.svg`} alt="" width={width} height={height} />
    </span>
  );
}
