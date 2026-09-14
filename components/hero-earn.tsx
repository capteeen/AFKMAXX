import { AfkCoin } from '@/components/afk-coin';

const coins = [
  { className: 'hero-coin hero-coin-1', size: 54 },
  { className: 'hero-coin hero-coin-2', size: 42 },
  { className: 'hero-coin hero-coin-3', size: 48 },
  { className: 'hero-coin hero-coin-4', size: 34 },
  { className: 'hero-coin hero-coin-5', size: 44 },
  { className: 'hero-coin hero-coin-6', size: 30 },
] as const;

export function HeroEarn() {
  return (
    <div className="hero-earn" aria-hidden>
      <svg className="hero-earn-path" viewBox="0 0 640 510" fill="none">
        <path
          d="M330 170c48-18 96-42 148-78"
          stroke="#5876FF"
          strokeWidth="2"
          strokeDasharray="5 7"
          opacity=".55"
        />
        <circle cx="478" cy="92" r="4" fill="#C8FF3D" />
      </svg>
      {coins.map((coin) => (
        <span key={coin.className} className={coin.className}>
          <AfkCoin size={coin.size} className="coin-spin" />
        </span>
      ))}
    </div>
  );
}
