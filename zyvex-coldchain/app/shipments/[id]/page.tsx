'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  RefreshCw,
  ShieldCheck,
  Thermometer,
  Truck,
} from 'lucide-react';
import WorkspaceLayout from '../../../components/layout/WorkspaceLayout';

type Shipment = {
  id: string;
  shipment_code: string;
  product: string;
  origin: string;
  destination: string;
  status: string;
  min_temp: number;
  max_temp: number;
  latest_temp: number | null;
  last_seen: string | null;
  created_at: string;
};

type Reading = {
  id?: string;
  temperature: number;
  recorded_at: string;
  device_id?: string;
  integrity_hash?: string;
  simulated?: boolean;
};

type AlertRecord = {
  id?: string;
  severity: string;
  message: string;
  temperature: number | null;
  created_at: string;
  resolved?: boolean;
};

type DetailResponse = {
  shipment?: Shipment;
  readings?: Reading[];
  alerts?: AlertRecord[];
  error?: string;
};

function formatDate(value?: string | null) {
  if (!value) return 'Not recorded';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Invalid date';

  return date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  });
}

export default function ShipmentDetailPage() {
  const params = useParams<{ id: string }>();
  const shipmentId = params.id;

  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const loadDetails = useCallback(async () => {
    if (!shipmentId) return;

    setError('');

    try {
      const response = await fetch(
        `/api/shipments/${encodeURIComponent(shipmentId)}`,
        { cache: 'no-store' }
      );

      const result = (await response.json()) as DetailResponse;

      if (!response.ok) {
        throw new Error(result.error || 'Could not load shipment details.');
      }

      if (!result.shipment) {
        throw new Error('Shipment details were not returned by the server.');
      }

      setShipment(result.shipment);
      setReadings(result.readings ?? []);
      setAlerts(result.alerts ?? []);
      setLastUpdated(new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Kolkata',
      }));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load shipment.'
      );
    } finally {
      setLoading(false);
    }
  }, [shipmentId]);

  useEffect(() => {
    void loadDetails();

    const timer = window.setInterval(() => {
      void loadDetails();
    }, 15000);

    return () => window.clearInterval(timer);
  }, [loadDetails]);

  const activeAlerts = alerts.filter((alert) => !alert.resolved);
  const latestReading = readings[0];
  const inRange = shipment?.latest_temp != null
    ? shipment.latest_temp >= shipment.min_temp &&
      shipment.latest_temp <= shipment.max_temp
    : null;

  return (
    <WorkspaceLayout
      title="Shipment details"
      subtitle="Temperature history, alerts and shipment integrity"
    >
      <div className="back-row">
        <Link href="/shipments">
          <ArrowLeft size={16} /> Back to shipments
        </Link>
        <button onClick={() => void loadDetails()} disabled={loading}>
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {loading && !shipment ? (
        <div className="panel loading">
          <RefreshCw size={22} className="spin" />
          <p>Loading shipment records from the server…</p>
        </div>
      ) : error && !shipment ? (
        <div className="panel error-panel">
          <AlertTriangle size={24} />
          <h2>Shipment could not be loaded</h2>
          <p>{error}</p>
          <p>
            The detail API must exist at
            {' '}<code>app/api/shipments/[id]/route.ts</code>.
          </p>
          <button onClick={() => void loadDetails()}>Try again</button>
        </div>
      ) : shipment ? (
        <>
          {error && <div className="inline-error">{error}</div>}

          <section className="hero panel">
            <div className="hero-top">
              <div className="product-icon"><Package size={25} /></div>
              <span className={`status ${shipment.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {shipment.status}
              </span>
            </div>
            <p className="eyebrow">SHIPMENT IDENTIFIER</p>
            <h2>{shipment.shipment_code}</h2>
            <p className="product-name">{shipment.product}</p>

            <div className="route">
              <div>
                <span>ORIGIN</span>
                <strong>{shipment.origin}</strong>
              </div>
              <Truck size={22} />
              <div>
                <span>DESTINATION</span>
                <strong>{shipment.destination}</strong>
              </div>
            </div>
          </section>

          <section className="metrics">
            <article className="panel metric">
              <Thermometer size={19} />
              <span>Latest temperature</span>
              <strong>
                {shipment.latest_temp == null
                  ? '—'
                  : `${shipment.latest_temp}°C`}
              </strong>
              <small>
                Allowed: {shipment.min_temp}°C to {shipment.max_temp}°C
              </small>
            </article>

            <article className="panel metric">
              <Activity size={19} />
              <span>Recorded readings</span>
              <strong>{readings.length}</strong>
              <small>Readings returned by the server</small>
            </article>

            <article className="panel metric">
              <AlertTriangle size={19} />
              <span>Unresolved alerts</span>
              <strong>{activeAlerts.length}</strong>
              <small>Based on recorded alert status</small>
            </article>

            <article className="panel metric">
              {inRange === false
                ? <AlertTriangle size={19} />
                : <CheckCircle2 size={19} />}
              <span>Temperature assessment</span>
              <strong className="assessment">
                {inRange === null ? 'No data' : inRange ? 'In range' : 'Out of range'}
              </strong>
              <small>Based on the shipment's latest temperature field</small>
            </article>
          </section>

          <section className="panel section">
            <div className="section-heading">
              <div>
                <h3><Activity size={18} /> Temperature history</h3>
                <p>Newest readings appear first.</p>
              </div>
              <span className="count">{readings.length} records</span>
            </div>

            {readings.length === 0 ? (
              <div className="empty">
                No temperature readings have been recorded for this shipment yet.
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Temperature</th>
                      <th>Sensor</th>
                      <th>Recorded at</th>
                      <th>Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readings.map((reading, index) => {
                      const safe = reading.temperature >= shipment.min_temp &&
                        reading.temperature <= shipment.max_temp;

                      return (
                        <tr key={`${reading.recorded_at}-${index}`}>
                          <td>
                            <strong>{reading.temperature}°C</strong>
                            <span className={`reading-state ${safe ? 'safe' : 'unsafe'}`}>
                              {safe ? 'In range' : 'Excursion'}
                            </span>
                          </td>
                          <td>{reading.device_id || 'Unknown sensor'}</td>
                          <td>{formatDate(reading.recorded_at)}</td>
                          <td>{reading.simulated ? 'Simulated' : 'Recorded'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="panel section">
            <div className="section-heading">
              <div>
                <h3><AlertTriangle size={18} /> Temperature alerts</h3>
                <p>Exceptions associated with this shipment.</p>
              </div>
              <span className="count">{alerts.length} records</span>
            </div>

            {alerts.length === 0 ? (
              <div className="empty">No alert records exist for this shipment.</div>
            ) : (
              <div className="alert-list">
                {alerts.map((alert, index) => (
                  <article className="alert-item" key={alert.id ?? `${alert.created_at}-${index}`}>
                    <AlertTriangle size={19} />
                    <div>
                      <strong>{alert.message}</strong>
                      <p>
                        {alert.severity} · {formatDate(alert.created_at)}
                        {alert.temperature != null
                          ? ` · ${alert.temperature}°C`
                          : ''}
                      </p>
                    </div>
                    <span className={alert.resolved ? 'resolved' : 'unresolved'}>
                      {alert.resolved ? 'Resolved' : 'Open'}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="panel section integrity">
            <ShieldCheck size={22} />
            <div>
              <h3>Shipment integrity</h3>
              <p>
                Shipment code: <strong>{shipment.shipment_code}</strong>
              </p>
              <p>
                Last sensor timestamp: {formatDate(shipment.last_seen)}
              </p>
              <p>
                Latest returned reading: {latestReading
                  ? formatDate(latestReading.recorded_at)
                  : 'No reading available'}
              </p>
              <p className="integrity-note">
                This page displays stored records. It does not itself prove
                blockchain anchoring or cryptographic verification.
              </p>
              <Link href="/integrity">Open integrity audit →</Link>
            </div>
          </section>

          <p className="updated"><Clock size={13} /> Page refreshed at {lastUpdated || '—'} IST</p>
        </>
      ) : null}

      <style jsx>{`
        .back-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; }
        .back-row a,.back-row button { display:inline-flex; align-items:center; gap:8px; font-size:12px; text-decoration:none; color:#087f78; }
        button { padding:10px 13px; border:1px solid #dbe4eb; background:white; border-radius:8px; cursor:pointer; }
        button:disabled { opacity:.6; cursor:wait; }
        .panel { background:white; border:1px solid #e2e9ef; border-radius:14px; }
        .hero { padding:25px; }
        .hero-top { display:flex; justify-content:space-between; align-items:center; }
        .product-icon { display:grid; place-items:center; width:48px; height:48px; border-radius:13px; background:#e4f5f2; color:#087f78; }
        .eyebrow { margin-top:20px; font-size:9px; color:#718294; letter-spacing:1.5px; }
        .hero h2 { margin:7px 0; font-size:27px; letter-spacing:-.7px; }
        .product-name { color:#68798b; font-size:13px; }
        .status { padding:7px 10px; border-radius:20px; font-size:10px; background:#e8eef4; color:#344b5e; }
        .status.delivered { background:#def6e8; color:#147844; }
        .status.in-transit { background:#dff3fa; color:#176d88; }
        .status.on-hold { background:#fff0d9; color:#975e08; }
        .route { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:18px; margin-top:26px; padding-top:20px; border-top:1px solid #edf0f4; }
        .route div { min-width:0; }
        .route div:last-child { text-align:right; }
        .route span { display:block; color:#8794a2; font-size:9px; letter-spacing:1px; margin-bottom:7px; }
        .route strong { font-size:13px; overflow-wrap:anywhere; }
        .route svg { color:#0b9589; }
        .metrics { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:13px; margin:16px 0; }
        .metric { padding:18px; display:flex; flex-direction:column; gap:9px; }
        .metric svg { color:#078b81; }
        .metric span { color:#728194; font-size:11px; }
        .metric strong { font-size:25px; letter-spacing:-.6px; }
        .metric small { color:#8491a0; font-size:10px; line-height:1.6; }
        .metric .assessment { font-size:17px; }
        .section { margin-top:16px; padding:22px; }
        .section-heading { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:18px; }
        h3 { display:flex; align-items:center; gap:9px; margin:0; font-size:15px; }
        h3 svg { color:#078b81; }
        .section-heading p { margin:7px 0 0; font-size:11px; color:#8190a0; }
        .count { padding:6px 8px; border-radius:6px; background:#f1f5f8; color:#657588; font-size:10px; white-space:nowrap; }
        .empty { padding:24px 10px; color:#7b8a99; font-size:12px; text-align:center; border:1px dashed #dce5eb; border-radius:9px; }
        .table-wrap { width:100%; overflow-x:auto; }
        table { width:100%; border-collapse:collapse; text-align:left; white-space:nowrap; }
        th { color:#8190a0; font-size:10px; font-weight:600; padding:12px; background:#f8fafc; }
        td { padding:13px 12px; border-bottom:1px solid #edf1f4; color:#586b7e; font-size:11px; }
        td strong { color:#20394c; }
        .reading-state { display:block; margin-top:5px; font-size:9px; }
        .safe { color:#168153; }
        .unsafe { color:#bd3737; }
        .alert-list { display:grid; gap:10px; }
        .alert-item { display:flex; gap:12px; align-items:center; padding:13px; border:1px solid #edf0f4; border-radius:9px; }
        .alert-item > svg { color:#c78022; flex-shrink:0; }
        .alert-item div { flex:1; min-width:0; }
        .alert-item strong { font-size:12px; }
        .alert-item p { color:#8190a0; font-size:10px; line-height:1.6; }
        .resolved,.unresolved { font-size:10px; white-space:nowrap; }
        .resolved { color:#13804b; }
        .unresolved { color:#b66a19; }
        .integrity { display:flex; gap:16px; }
        .integrity > svg { color:#078b81; flex-shrink:0; }
        .integrity p { color:#748497; font-size:11px; line-height:1.6; }
        .integrity-note { max-width:700px; }
        .integrity a { color:#087f78; text-decoration:none; font-size:12px; font-weight:700; }
        .updated { display:flex; align-items:center; justify-content:flex-end; gap:6px; color:#8793a1; font-size:10px; margin-top:18px; }
        .loading,.error-panel { padding:35px; text-align:center; }
        .error-panel { color:#9f3838; }
        .error-panel p { font-size:12px; line-height:1.7; }
        .inline-error { margin-bottom:12px; color:#a83333; font-size:12px; }
        .spin { animation:spin 1.5s linear infinite; }
        @keyframes spin { to { transform:rotate(360deg); } }
        @media(max-width:1000px) { .metrics { grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media(max-width:560px) {
          .hero,.section { padding:16px; }
          .route { gap:9px; }
          .route strong { font-size:11px; }
          .metrics { gap:9px; }
          .metric { padding:13px; }
          .metric strong { font-size:21px; }
          .section-heading { align-items:flex-start; }
          .integrity { gap:10px; }
        }
        @media(prefers-reduced-motion:reduce) { .spin { animation:none; } }
      `}</style>
    </WorkspaceLayout>
  );
}