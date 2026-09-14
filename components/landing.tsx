import Link from 'next/link';
import { EarnScene } from '@/components/earn-scene';
import { HeroEarn } from '@/components/hero-earn';

export function Landing() {
  return (
    <main id="main">
      <section className="hero wrap">
        <div className="hero-top micro">
          <span><i className="dot" /> YOUR CONNECTION. YOUR CALL.</span>
          <span>EST. 2026 / PILOT</span>
        </div>
        <div className="hero-grid">
          <div className="hero-copy">
            <h1>YOU GO AFK.<br />IT DOES A<br /><span>SIDE QUEST.</span></h1>
            <p>Let your internet connection run small, approved website checks for paying customers while you’re away.</p>
            <Link className="button lime" href="/sign-in">Open the app <span>↗</span></Link>
            <div className="hero-note micro">OPT IN. SET LIMITS. PAUSE ANYTIME.</div>
          </div>
          <div className="hero-art">
            <div className="art-tag micro"><span className="cross">+</span> SOMEWHERE, A CHAIR IS EMPTY.</div>
            <div className="hero-art-stage">
              <img src="/assets/desk.svg" alt="An empty desk with an AFK monitor connected to an approved website check" width={640} height={510} />
              <HeroEarn />
            </div>
            <div className="art-footer">
              <span className="micro">YOU: TOUCHING GRASS.<br />CONNECTION: ON A SMALL MISSION.</span>
              <span className="sticker">AFK<br /><small>NOT MIA.</small></span>
            </div>
          </div>
        </div>
        <div className="hero-bottom micro">
          <span>LESS MAIN CHARACTER. MORE BACKGROUND TASK.</span>
          <a href="#how">SCROLL TO GET THE LORE ↓</a>
        </div>
      </section>
      <div className="ribbon">
        <span>SMALL CHECKS.</span>
        <img src="/assets/mark-light.svg" alt="" width={34} height={30} />
        <span>HARD LIMITS.</span>
        <img src="/assets/mark-light.svg" alt="" width={34} height={30} />
        <span>YOUR OFF SWITCH.</span>
        <img src="/assets/mark-light.svg" alt="" width={34} height={30} />
        <span>THAT’S THE WHOLE THING.</span>
        <img src="/assets/mark-light.svg" alt="" width={34} height={30} />
        <span>$AFK POWERS IT.</span>
      </div>
      <section id="how" className="section wrap">
        <div className="section-heading">
          <span className="micro eyebrow">01 / THE SHORT VERSION</span>
          <h2>A LITTLE WORK.<br />WITHOUT THE <em>LORE.</em></h2>
          <p>Your connection takes the side quest.<br />You keep the controls.</p>
        </div>
        <div className="steps">
          <article>
            <span className="step-num">01</span>
            <img className="step-scene" src="/assets/permission-console.svg" alt="A permission console with selected destinations, usage limits, and a physical off switch" width={640} height={420} />
            <h3>Set your limits.</h3>
            <p>Opt in, choose approved destinations, and set when checks can run and how much data they can use.</p>
          </article>
          <article>
            <span className="step-num">02</span>
            <img className="step-scene" src="/assets/check-route.svg" alt="A desktop sends a bounded request to an approved website and receives a result" width={640} height={420} />
            <h3>Run approved checks.</h3>
            <p>When eligible work is available, your extension checks a customer’s public website from your machine.</p>
          </article>
          <article>
            <span className="step-num">03</span>
            <img className="step-scene" src="/assets/payout-receipt.svg" alt="A paper receipt connects a reviewed check to its record" width={640} height={420} />
            <h3>Accepted work may pay.</h3>
            <p>Results are reviewed before acceptance. $AFK settlement is a placeholder until a listing exists. Robinhood Chain is intended, not live.</p>
          </article>
        </div>
      </section>
      <section id="trust" className="section trust-section">
        <div className="wrap trust-grid">
          <div>
            <span className="micro eyebrow">02 / CONSENT IS THE WHOLE POINT</span>
            <h2>YOUR WI-FI.<br />YOUR RULES.<br /><em>NO WEIRD STUFF.</em></h2>
            <p>Useful doesn’t mean unrestricted. Checks are allowlisted HTTPS GETs from the extension. No proxy. No browsing history.</p>
          </div>
          <div className="trust-answers">
            <article><span>01</span><div><h3>What uses my connection?</h3><p>Small GET requests to approved public websites, run by the AFKMAXX extension on this machine.</p></div></article>
            <article><span>02</span><div><h3>Can I pause it?</h3><p>Yes. Pause in the app or the extension popup. A daily data cap is enforced on the device and on the server.</p></div></article>
            <article><span>03</span><div><h3>Is a check a payout?</h3><p>No. Results stay unaudited until an admin accepts them. Accepted rows write a $AFK placeholder, not a live transfer.</p></div></article>
          </div>
        </div>
      </section>
      <section id="token" className="section wrap token-section">
        <div className="token-grid">
          <div>
            <div className="section-heading">
              <span className="micro eyebrow">03 / THE NATIVE MEMECOIN</span>
              <h2>TOUCH GRASS.<br />HOLD <em>$AFK.</em></h2>
              <p>$AFK is how the side quest is meant to get paid.<br />It is not live on this site.</p>
            </div>
            <p className="muted">Robinhood is the intended first public market. AFKMAXX is independent and is not endorsed by Robinhood. Nothing here is an offer to buy or sell tokens.</p>
            <Link className="text-link" href="/app">See the $AFK bag in the app ↗</Link>
          </div>
          <EarnScene />
        </div>
      </section>
      <section id="apps" className="section apps-section">
        <div className="wrap">
          <div className="section-heading">
            <span className="micro eyebrow">04 / THE RUNTIME</span>
            <h2>WEB APP PLUS<br /><em>EXTENSION.</em></h2>
            <p>The webpage cannot read other sites. The extension can, only for hosts you approve.</p>
          </div>
          <div className="apps-grid">
            <Link className="app-card" href="/sign-in">
              <span className="micro">WEB APP</span>
              <h3>SIGN IN. SET LIMITS.</h3>
              <p>Accounts, jobs, history, and the placeholder bag live here.</p>
              <span className="text-link">Open the app ↗</span>
            </Link>
            <Link className="app-card" href="/app">
              <span className="micro">EXTENSION</span>
              <h3>INSTALL ON CHROME.</h3>
              <p>Polls jobs, GETs allowlisted HTTPS, posts results. Pause anytime.</p>
              <span className="text-link">Install steps in the app ↗</span>
            </Link>
          </div>
        </div>
      </section>
      <section id="pilot" className="pilot">
        <div className="wrap">
          <span className="micro">A SMALL SIDE QUEST. ON YOUR TERMS.</span>
          <h2>GO LIVE YOUR LIFE.<br />WE’LL CHECK <span>BACK.</span></h2>
          <div className="pilot-bottom">
            <p>Sign in to open the app. No wallet. No token sale. The extension does the fetch.</p>
            <div className="pilot-actions">
              <Link className="button dark" href="/sign-in">Sign in <span>↗</span></Link>
              <Link className="button outline" href="/privacy">Privacy <span>↗</span></Link>
            </div>
          </div>
        </div>
      </section>
      <footer className="wrap">
        <Link className="brand" href="/"><img src="/assets/mark.svg" alt="" width={26} height={25} />AFKMAXX</Link>
        <span className="micro">AWAY FROM KEYBOARD. STILL YOUR CALL.</span>
        <Link href="/specimens">Specimens ↗</Link>
        <span className="micro">© 2026 AFKMAXX</span>
      </footer>
    </main>
  );
}
