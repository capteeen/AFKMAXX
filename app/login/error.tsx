'use client';

function friendly(error: Error & { digest?: string }) {
  const message = error.message || '';
  if (/minified react error #441/i.test(message) || error.digest) {
    return 'The page failed to render on the server. Try again. If this keeps happening after a deploy, the server logs will have the real error.';
  }
  if (/load failed|failed to fetch/i.test(message)) {
    return 'Could not reach the auth server. Use http://127.0.0.1:4173/login and try again.';
  }
  return message || 'Something broke. Try again.';
}

export default function LoginError({
  error,
  retry,
  reset
}: {
  error: Error & { digest?: string };
  retry?: () => void;
  reset?: () => void;
}) {
  const again = retry || reset;
  return (
    <main id="main" className="wrap desktop-page">
      <p className="feedback" role="alert">{friendly(error)}</p>
      {again ? (
        <button className="button lime" type="button" onClick={() => again()}>
          Try again <span>↗</span>
        </button>
      ) : (
        <a className="button lime" href="/login">Back to login <span>↗</span></a>
      )}
    </main>
  );
}
