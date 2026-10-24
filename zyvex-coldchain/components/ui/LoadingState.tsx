export function LoadingState({ label = 'Loading…' }: { label?: string }) { return <div role="status" className="loading-state"><span className="spinner" />{label}</div>; }
