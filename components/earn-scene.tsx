import { AfkCoin } from '@/components/afk-coin';

export function EarnScene() {
  return (
    <figure className="earn-scene">
      <svg viewBox="0 0 560 420" fill="none" role="img" aria-labelledby="earn-title earn-desc">
        <title id="earn-title">Idle connection stacking $AFK</title>
        <desc id="earn-desc">
          An empty desk monitor runs an approved check while $AFK tokens stack into a bag.
        </desc>
        <defs>
          <pattern id="earn-grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M32 0H0V32" stroke="#F4F1E8" strokeOpacity=".05" />
          </pattern>
        </defs>
        <rect width="560" height="420" fill="#0B0D12" />
        <rect width="560" height="420" fill="url(#earn-grid)" />
        <ellipse cx="280" cy="372" rx="210" ry="28" fill="#000" opacity=".35" />

        <path d="m48 268 248-72 148 68-246 86z" fill="#222728" stroke="#788079" />
        <path d="M48 268v14l140 70 256-86v-4" stroke="#788079" strokeWidth="5" />
        <path d="m156 92 168-42q10-3 10 9v136l-180 50V102q0-8 2-10" fill="#111617" stroke="#949a91" strokeWidth="2" />
        <path d="m166 104 148-38v122l-148 44z" fill="#161b1a" />
        <rect x="188" y="128" width="18" height="52" rx="4" fill="#C8FF3D" />
        <rect x="232" y="128" width="18" height="52" rx="4" fill="#C8FF3D" />
        <path d="m226 136-16 22h11l-5 16 18-25h-8z" fill="#5876FF" />
        <path d="M334 118h86" stroke="#5876FF" strokeWidth="2" strokeDasharray="5 6" className="earn-dash" />
        <circle cx="334" cy="118" r="4" fill="#5876FF" />

        <g className="earn-receipt">
          <path d="M338 86h142l8 8v78H338z" fill="#F4F1E8" />
          <path d="M352 108h70M352 122h48M352 136h62" stroke="#0B0D12" strokeWidth="3" />
          <path d="m430 112 6 6 12-14" stroke="#5876FF" strokeWidth="3" className="earn-tick" />
        </g>

        <rect x="36" y="36" width="118" height="28" rx="3" fill="#C8FF3D" />
        <text x="48" y="55" fill="#0B0D12" fontFamily="ui-monospace,monospace" fontSize="11" letterSpacing="1.4">
          CHECKING
        </text>
      </svg>
      <div className="earn-stack" aria-hidden>
        <span className="earn-stack-coin"><AfkCoin size={72} className="coin-spin" /></span>
        <span className="earn-stack-coin"><AfkCoin size={72} className="coin-spin" /></span>
        <span className="earn-stack-coin"><AfkCoin size={72} className="coin-spin" /></span>
        <span className="earn-drop"><AfkCoin size={56} className="coin-spin" /></span>
      </div>
      <div className="earn-bag" aria-hidden>
        <span className="micro">BAG</span>
        <strong>+$AFK</strong>
      </div>
    </figure>
  );
}
