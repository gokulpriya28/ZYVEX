export function AlertBanner({ message, severity = 'critical' }: { message: string; severity?: string }) { return <div role="alert" className={`alert-banner alert-${severity}`}>{message}</div>; }
