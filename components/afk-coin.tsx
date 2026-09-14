type AfkCoinProps = {
  size?: number;
  className?: string;
};

export function AfkCoin({ size = 48, className }: AfkCoinProps) {
  return (
    <svg
      className={className}
      width={size}
      height={Math.round(size * 1.08)}
      viewBox="0 0 72 78"
      fill="none"
      aria-hidden
    >
      <ellipse cx="36" cy="50" rx="31" ry="20" fill="#2436a8" />
      <path d="M5 32v16c0 11 13.9 20 31 20s31-9 31-20V32" fill="#5876FF" />
      <path d="M5 32v7c0 11 13.9 20 31 20s31-9 31-20v-7" fill="#3f58d6" />
      <ellipse cx="36" cy="30" rx="31" ry="20" fill="#C8FF3D" />
      <ellipse cx="36" cy="30" rx="23" ry="14.5" stroke="#0B0D12" strokeWidth="2" />
      <path d="M40 16 28 32h9l-4 14 16-20h-9z" fill="#5876FF" />
    </svg>
  );
}
