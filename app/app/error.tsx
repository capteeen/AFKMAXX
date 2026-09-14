'use client';

export default function AppError({
  error,
  retry,
  reset
}: {
  error: Error & { digest?: string };
  retry?: () => void;
  reset?: () => void;
}) {
  const again = retry || reset;
  const minified = /minified react error #441/i.test(error.message || '');
  return (
    <main id="main" className="wrap desktop-page">
      <p className="feedback" role="alert">
        {minified || error.digest
          ? 'The app desk failed to render. Try again, or sign in once more.'
          : error.message}
      </p>
      <div className="pilot-actions">
        {again ? (
          <button className="button lime" type="button" onClick={() => again()}>
            Try again <span>↗</span>
          </button>
        ) : null}
        <a className="button outline" href="/sign-in">Sign in <span>↗</span></a>
      </div>
    </main>
  );
}
