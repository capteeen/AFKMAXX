'use client';

import { useEffect, useState } from 'react';

export function AdminBoard() {
  const [users, setUsers] = useState<{ id: string; email: string; role: string; status: string }[]>([]);
  const [destinations, setDestinations] = useState<{ id: string; hostname: string; status: string; owner: { email: string } }[]>([]);
  const [results, setResults] = useState<{ id: string; statusCode: number; review: string; participant: { email: string }; job: { destination: { hostname: string } } }[]>([]);
  const [error, setError] = useState('');

  async function load() {
    const [u, d, r] = await Promise.all([fetch('/api/admin/users'), fetch('/api/admin/destinations'), fetch('/api/admin/results')]);
    if (!u.ok) { setError('Admin only'); return; }
    setUsers((await u.json()).users);
    setDestinations((await d.json()).destinations);
    setResults((await r.json()).results);
  }

  useEffect(() => { load(); }, []);

  async function patch(url: string, body: object) {
    await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    await load();
  }

  if (error) return <p className="muted">{error}</p>;

  return (
    <div className="desk-stage" style={{ display: 'grid', gap: 40 }}>
      <section>
        <h3 className="desk-title">USERS</h3>
        {users.map(user => (
          <div className="screen-row" key={user.id}>
            <span>{user.email}<br /><small>{user.role}</small></span>
            <span>
              {user.status}{' '}
              <button type="button" className="button outline" onClick={() => patch('/api/admin/users', { id: user.id, status: user.status === 'banned' ? 'active' : 'banned' })}>
                {user.status === 'banned' ? 'Unban' : 'Ban'}
              </button>
            </span>
          </div>
        ))}
      </section>
      <section>
        <h3 className="desk-title">DESTINATIONS</h3>
        {destinations.map(dest => (
          <div className="screen-row" key={dest.id}>
            <span>{dest.hostname}<br /><small>{dest.owner.email}</small></span>
            <span>
              {dest.status}{' '}
              <button type="button" className="button outline" onClick={() => patch('/api/admin/destinations', { id: dest.id, status: dest.status === 'approved' ? 'revoked' : 'approved' })}>
                {dest.status === 'approved' ? 'Revoke' : 'Approve'}
              </button>
            </span>
          </div>
        ))}
      </section>
      <section>
        <h3 className="desk-title">RESULTS</h3>
        {results.map(row => (
          <div className="screen-row" key={row.id}>
            <span>{row.job.destination.hostname} · {row.statusCode}<br /><small>{row.participant.email} · {row.review}</small></span>
            <span>
              <button type="button" className="button outline" onClick={() => patch('/api/admin/results', { id: row.id, review: 'accepted' })}>Accept</button>
              <button type="button" className="button outline" onClick={() => patch('/api/admin/results', { id: row.id, review: 'rejected' })}>Reject</button>
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}
