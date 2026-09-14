'use client';

export default function LoginError({
  error,
  retry
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  const network = /load failed|failed to fetch/i.test(error.message);
  return (
    <main id="main" className="wrap desktop-page">
      <p className="feedback" role="alert">
        {network
          ? 'Could not reach the auth server. Use http://127.0.0.1:4173/login and try again.'
          : error.message}
      </p>
      <button className="button lime" type="button" onClick={() => retry()}>
        Try again <span>↗</span>
      </button>
    </main>
  );
}
