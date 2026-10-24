export function StatusPill({ status }: { status: string }) { const safe = status.replace(/[^a-z0-9_-]/gi, ''); return <span className={`status-pill status-${safe.toLowerCase()}`}>{status}</span>; }
