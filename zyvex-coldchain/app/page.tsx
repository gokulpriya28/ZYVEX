
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Database,
  Download,
  FlaskConical,
  LockKeyhole,
  MapPin,
  Package,
  RefreshCw,
  ShieldCheck,
  Thermometer,
  Wallet,
  Wifi,
  XCircle,
  Zap,
} from 'lucide-react';
import { keccak256, toUtf8Bytes } from 'ethers';
import {
  anchorHash,
  checkAnchoredHash,
  connectWallet as connectLedgerWallet,
  getContractAddress,
} 

from '@/lib/contract';

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
  id: string;
  shipment_id: string;
  temperature: number;
  recorded_at: string;
  device_id: string;
  integrity_hash: string;
  signature: string;
  simulated: boolean;
};

type Alert = {
  id: string;
  shipment_id: string;
  severity: string;
  message: string;
  temperature: number;
  created_at: string;
  resolved: boolean;
};

type Dashboard = {
  mode: string;
  shipments: Shipment[];
  readings: Reading[];
  alerts: Alert[];
};

const CONTRACT =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.trim() || '';
const SEPOLIA_CHAIN_ID = 11155111n;

function timeAgo(value?: string | null) {
  if (!value) return 'No reading';

  const mins = Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 60000)
  );

  return mins < 1
    ? 'Just now'
    : mins < 60
      ? `${mins}m ago`
      : `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
}

function fmtTime(value: string) {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function temperatureStatus(s: Shipment) {
  if (s.latest_temp === null || s.latest_temp === undefined) {
    return 'unknown';
  }

  return s.latest_temp < s.min_temp || s.latest_temp > s.max_temp
    ? 'critical'
    : 'safe';
}

/**
 * This must remain identical for both anchoring and verification.
 * The same readings in the same order produce the same digest.
 */
function createBatchDigest(readings: Reading[]) {
  const batch = readings
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((r) => ({
      id: r.id,
      hash: r.integrity_hash,
      temperature: Number(r.temperature),
      at: r.recorded_at,
    }));

  if (!batch.length) {
    throw new Error('No readings available for this operation.');
  }

  return keccak256(toUtf8Bytes(JSON.stringify(batch)));
  
}

export default function Home() {
  const [data, setData] = useState<Dashboard>({
    mode: 'loading',
    shipments: [],
    readings: [],
    alerts: [],
  });

  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [selected, setSelected] = useState('');
  const [temperature, setTemperature] = useState('5.2');
  const [device, setDevice] = useState('SIM-SENSOR-01');
  const [verified, setVerified] = useState<Record<string, string>>({});
  const [wallet, setWallet] = useState('');
  const [chainStatus, setChainStatus] = useState('Not connected');
  const [now, setNow] = useState(Date.now());

  const refresh = useCallback(async () => {
    try {
      const r = await fetch('/api/dashboard', {
        cache: 'no-store',
      });

      const d = await r.json();

      if (!r.ok) {
        throw new Error(d.error || 'Could not load dashboard');
      }

      setData(d);

      setSelected((old) =>
        old && d.shipments.some((s: Shipment) => s.id === old)
          ? old
          : d.shipments[0]?.id || ''
      );
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : 'Dashboard request failed'
      );
    }
  }, []);

  useEffect(() => {
    void refresh();

    const poll = setInterval(() => void refresh(), 15000);
    const clock = setInterval(() => setNow(Date.now()), 30000);

    return () => {
      clearInterval(poll);
      clearInterval(clock);
    };
  }, [refresh]);

  const shipmentById = useMemo(
    () => Object.fromEntries(data.shipments.map((s) => [s.id, s])),
    [data.shipments]
  );

  const critical = data.shipments.filter(
    (s) => temperatureStatus(s) === 'critical'
  ).length;

  const safe = data.shipments.filter(
    (s) => temperatureStatus(s) === 'safe'
  ).length;

  const recentReadings = data.readings.slice(0, 8);

  const active = data.shipments.filter(
    (s) => s.status.toLowerCase() !== 'delivered'
  ).length;

  const selectedShipment = data.shipments.find(
    (s) => s.id === selected
  );

  async function addReading(value?: number) {
    if (!selected) return;

    setBusy(true);
    setNotice('');

    try {
      const r = await fetch('/api/readings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shipment_id: selected,
          temperature: value ?? Number(temperature),
          device_id: device,
          simulated: true,
        }),
      });

      const d = await r.json();

      if (!r.ok) {
        throw new Error(d.error || 'Reading failed');
      }

      setNotice(
        `Reading ${Number(d.reading.temperature).toFixed(1)}°C saved and integrity-tagged.`
      );

      await refresh();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : 'Could not save reading');
    } finally {
      setBusy(false);
    }
  }

  async function addDemoAlert() {
    setBusy(true);
    setNotice('');

    try {
      const r = await fetch('/api/demo-seed', {
        method: 'POST',
      });

      const d = await r.json();

      if (!r.ok) {
        throw new Error(d.error || 'Demo failed');
      }

      setNotice(d.message);
      await refresh();
    } catch (e) {
      setNotice(
        e instanceof Error ? e.message : 'Could not add demo reading'
      );
    } finally {
      setBusy(false);
    }
  }

  // Existing backend hash/HMAC verification for an individual reading.
  async function verify(id: string) {
    setVerified((v) => ({ ...v, [id]: 'checking' }));

    try {
      const r = await fetch(
        `/api/verify?id=${encodeURIComponent(id)}`
      );

      const d = await r.json();

      if (!r.ok) {
        throw new Error(d.error || 'Verification failed');
      }
console.log('Reading verification result:', d);
      setVerified((v) => ({
        ...v,
        [id]:
          d.hashMatches && d.signatureValid
            ? 'valid'
            : 'failed',
      }));
    } catch (e) {
      setVerified((v) => ({ ...v, [id]: 'failed' }));

      setNotice(
        e instanceof Error ? e.message : 'Verification failed'
      );
    }
  }

  // Connect MetaMask and enforce Sepolia through lib/contact.ts.
  async function connectWallet() {
    try {
      const result = await connectLedgerWallet();

      setWallet(result.account);
      setChainStatus(`Sepolia connected · Chain ID ${result.chainId}`);

      if (!CONTRACT) {
        setNotice(
          'Wallet connected. Configure NEXT_PUBLIC_COLDCHAIN_CONTRACT_ADDRESS in .env.local.'
        );
      } else {
        setNotice('MetaMask connected to Sepolia successfully.');
      }
    } catch (e) {
      setChainStatus('Not connected');

      setNotice(
        e instanceof Error ? e.message : 'Wallet connection failed'
      );
    }
  }

  // Anchor a reproducible digest using the deployed anchor(bytes32) function.
  async function anchorBatch() {
    setBusy(true);
    setNotice('');

    try {
      if (!CONTRACT) {
        throw new Error(
          'Set NEXT_PUBLIC_COLDCHAIN_CONTRACT_ADDRESS in .env.local.'
        );
      }

      const digest = createBatchDigest(data.readings);
      console.log('Zyvex batch digest:', digest);
console.log('Contract address:', getContractAddress());

      setChainStatus('Waiting for wallet confirmation…');

      const result = await anchorHash(digest);

      setWallet(result.account);
      setChainStatus('Anchored on chain');

      let persistence = '';

      try {
        const saved = await fetch('/api/anchors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            batch_hash: digest,
            transaction_hash: result.txHash,
            contract_address: CONTRACT,
            chain_id: Number(result.chainId),
            anchored_by: result.account,
          }),
        });

        const savedResult = await saved.json();

        if (!saved.ok) {
          persistence =
            savedResult.error ||
            'On-chain anchoring succeeded, but saving the API record failed.';
        } else {
          persistence = savedResult.message || '';
        }
      } catch {
        persistence =
          'On-chain anchoring succeeded; API persistence could not be confirmed.';
      }

      setNotice(
        `Batch anchored successfully. Digest: ${digest}. Transaction: ${result.txHash}. ${persistence}`
      );
   } catch (e) {
  console.error('ANCHOR ERROR:', e);
  setChainStatus('Not anchored');

  setNotice(
    e instanceof Error
      ? `Anchor error: ${e.message}`
      : `Anchor error: ${String(e)}`
  );
}
  }

  // Verify the same batch digest using verify(bytes32).
  async function verifyBatchOnChain() {
    setBusy(true);
    setNotice('');

    try {
      if (!CONTRACT) {
        throw new Error(
          'Set NEXT_PUBLIC_COLDCHAIN_CONTRACT_ADDRESS in .env.local.'
        );
      }

      const digest = createBatchDigest(data.readings);
      console.log('Zyvex batch digest:', digest);
console.log('Contract address:', getContractAddress());

      setChainStatus('Checking blockchain…');

      const result = await checkAnchoredHash(digest);

      if (result.exists) {
        setChainStatus('Anchored on chain');

        setNotice(
          `Blockchain verification successful. Timestamp: ${new Date(
            Number(result.timestamp) * 1000
          ).toLocaleString()}. Anchored by: ${result.sender}. Hash: ${digest}`
        );
      } else {
        setChainStatus('Hash not found on chain');

        setNotice(
          `This batch hash was not found on the connected contract. Hash: ${digest}`
        );
      }
    } catch (e) {
  console.error('Zyvex BLOCKCHAIN VERIFY failed:', e);
  setChainStatus('Verification failed');

  setNotice(
    e instanceof Error ? e.message : String(e)
  );
} finally {
  setBusy(false);
}
    
  }

  function exportReport() {
    const report = {
      product: 'Zyvex ColdChain Ledger',
      exported_at: new Date().toISOString(),
      mode: data.mode,
      disclaimer:
        'Prototype demo data may be simulated. A hash does not prove a sensor measurement was physically accurate.',
      shipments: data.shipments,
      readings: data.readings,
      alerts: data.alerts,
    };

    const blob = new Blob(
      [JSON.stringify(report, null, 2)],
      { type: 'application/json' }
    );

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = `zyvex-audit-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;

    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <ShieldCheck size={23} />
          </div>

          <div>
            <div className="brand-name">
              ZYVEX<span>°</span>
            </div>
            <div className="brand-sub">COLDCHAIN LEDGER</div>
          </div>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav>
          <a className="nav-item active">
            <Activity size={17} /> Overview <span className="nav-dot" />
          </a>
          <a className="nav-item" href="#shipments">
            <Package size={17} /> Shipments
          </a>
          <a className="nav-item" href="#readings">
            <Thermometer size={17} /> Temperature logs
          </a>
          <a className="nav-item" href="#alerts">
            <AlertTriangle size={17} /> Alerts
            {critical > 0 && (
              <span className="nav-count">{critical}</span>
            )}
          </a>
          <a className="nav-item" href="#integrity">
            <LockKeyhole size={17} /> Integrity &amp; chain
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="secure-card">
            <div className="secure-icon">
              <LockKeyhole size={16} />
            </div>
            <strong>Evidence protection</strong>
            <p>Readings are hash-tagged and integrity checked.</p>
            <div className="secure-state">
              <span /> API integrity service online
            </div>
          </div>

          <div className="profile">
            <div className="avatar">Z</div>
            <div className="profile-copy">
              <strong>Zyvex Demo Lab</strong>
              <span>Hackathon workspace</span>
            </div>
            <ChevronDown size={15} />
          </div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumbs">
            Workspace <span>/</span> <strong>Overview</strong>
          </div>

          <div className="top-actions">
            <div className="live-pill">
              <span /> LIVE MONITORING
            </div>

            <button
              className="icon-button"
              title="Refresh data"
              onClick={() => void refresh()}
            >
              <RefreshCw size={16} />
            </button>

            <button
              className="button button-outline small"
              onClick={exportReport}
            >
              <Download size={15} /> Export audit
            </button>
          </div>
        </header>

        <div className="page-content">
          <div className="hero-row">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" />
                TEMPERATURE ASSURANCE PLATFORM
              </div>

              <h1>
                Cold chain, <em>proven.</em>
              </h1>

              <p className="hero-copy">
                Monitor sensitive shipments, detect excursions early,
                and make every transport record verifiable.
              </p>
            </div>

            <div className="hero-right">
              <div className="sync-status">
                <span className="sync-orb">
                  <Wifi size={16} />
                </span>

                <div>
                  <strong>
                    {data.mode === 'supabase'
                      ? 'Supabase connected'
                      : data.mode === 'demo'
                        ? 'Demo environment'
                        : 'Connecting…'}
                  </strong>

                  <span>
                    Last refresh{' '}
                    {new Date(now)
                      .toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                        timeZone: 'Asia/Kolkata',
                      })
                      .toUpperCase()}
                  </span>
                </div>
              </div>

              <button
                className="button button-primary"
                onClick={() => void addDemoAlert()}
                disabled={busy}
              >
                <Zap size={16} /> Run excursion demo
              </button>
            </div>
          </div>

          {notice && (
            <div className="notice">
              <div>
                <Activity size={16} />
                {notice}
              </div>

              <button
                onClick={() => setNotice('')}
                aria-label="Dismiss notice"
              >
                <XCircle size={16} />
              </button>
            </div>
          )}

          <div className="stat-grid">
            <Stat
              icon={<Package size={18} />}
              label="Tracked shipments"
              value={data.shipments.length.toString()}
              note={`${active} currently moving`}
              tint="blue"
            />

            <Stat
              icon={<CheckCircle2 size={18} />}
              label="Within temperature"
              value={safe.toString()}
              note="Latest readings in range"
              tint="green"
            />

            <Stat
              icon={<AlertTriangle size={18} />}
              label="Active excursions"
              value={critical.toString()}
              note={
                critical
                  ? 'Immediate review recommended'
                  : 'No active critical readings'
              }
              tint={critical ? 'red' : 'green'}
            />

            <Stat
              icon={<Activity size={18} />}
              label="Recorded readings"
              value={data.readings.length.toString()}
              note="Integrity tagged"
              tint="violet"
            />
          </div>

          <div className="content-grid">
            <section className="panel shipment-panel" id="shipments">
              <div className="panel-heading">
                <div>
                  <div className="section-kicker">FLEET VISIBILITY</div>
                  <h2>Shipment monitor</h2>
                </div>
                <span className="count-chip">
                  {data.shipments.length} shipments
                </span>
              </div>

              <div className="shipment-list">
                {data.shipments.map((s) => {
                  const status = temperatureStatus(s);

                  return (
                    <button
                      key={s.id}
                      className={`shipment-row ${
                        selected === s.id ? 'selected' : ''
                      }`}
                      onClick={() => setSelected(s.id)}
                    >
                      <div className={`shipment-symbol ${status}`}>
                        <Package size={18} />
                      </div>

                      <div className="shipment-info">
                        <div className="shipment-code">
                          {s.shipment_code}
                          <span className={`status-badge ${status}`}>
                            {status === 'critical'
                              ? 'EXCURSION'
                              : status === 'safe'
                                ? 'IN RANGE'
                                : 'NO DATA'}
                          </span>
                        </div>

                        <strong>{s.product}</strong>

                        <div className="route">
                          <MapPin size={12} />
                          {s.origin} <span>→</span> {s.destination}
                        </div>
                      </div>

                      <div className="shipment-temp">
                        <strong className={status === 'critical' ? 'hot' : ''}>
                          {s.latest_temp === null
                            ? '—'
                            : `${Number(s.latest_temp).toFixed(1)}°`}
                        </strong>
                        <span>
                          Target {s.min_temp}–{s.max_temp}°C
                        </span>
                        <small>{timeAgo(s.last_seen)}</small>
                      </div>
                    </button>
                  );
                })}

                {!data.shipments.length && (
                  <div className="empty-state">
                    No shipments found. Apply the SQL schema and add a
                    shipment to Supabase, or use demo mode.
                  </div>
                )}
              </div>

              <div className="panel-footer">
                <span>
                  <span className="legend-dot green" /> In range
                </span>
                <span>
                  <span className="legend-dot red" /> Excursion detected
                </span>
                <span className="footer-updated">
                  <RefreshCw size={12} /> Auto refresh · 15 sec
                </span>
              </div>
            </section>

            <section className="panel telemetry-panel">
              <div className="panel-heading">
                <div>
                  <div className="section-kicker">LIVE TELEMETRY</div>
                  <h2>Reading simulator</h2>
                </div>
                <div className="icon-soft">
                  <Thermometer size={18} />
                </div>
              </div>

              <p className="panel-description">
                Send a sample sensor reading to the backend. Thresholds
                are configured per shipment.
              </p>

              <label className="field-label">SELECT SHIPMENT</label>

              <select
                className="field"
                value={selected}
                onChange={(e) => setSelected(e.target.value)}
              >
                {data.shipments.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shipment_code} · {s.product}
                  </option>
                ))}
              </select>

              <div className="input-pair">
                <div>
                  <label className="field-label">TEMPERATURE (°C)</label>
                  <div className="temp-input">
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                    />
                    <span>°C</span>
                  </div>
                </div>

                <div>
                  <label className="field-label">DEVICE ID</label>
                  <input
                    className="field"
                    value={device}
                    onChange={(e) => setDevice(e.target.value)}
                    maxLength={80}
                  />
                </div>
              </div>

              {selectedShipment && (
                <div className="threshold-note">
                  <Thermometer size={15} />
                  <span>
                    Allowed range:{' '}
                    <strong>
                      {selectedShipment.min_temp}°C –{' '}
                      {selectedShipment.max_temp}°C
                    </strong>
                  </span>
                </div>
              )}

              <button
                className="button button-primary full"
                disabled={
                  busy ||
                  !selected ||
                  temperature.trim() === '' ||
                  !Number.isFinite(Number(temperature))
                }
                onClick={() => void addReading()}
              >
                <Zap size={16} />
                {busy ? 'Processing…' : 'Submit temperature reading'}
              </button>

              <div className="simulator-note">
                <FlaskConical size={14} />
                Simulator only — no physical sensor connected.
              </div>

              <div className="divider" />

              <div className="integrity-mini">
                <div className="mini-icon">
                  <LockKeyhole size={16} />
                </div>
                <div>
                  <strong>Server-side integrity tag</strong>
                  <span>SHA-256 fingerprint + HMAC verification</span>
                </div>
                <span className="mini-check">
                  <CheckCircle2 size={16} />
                </span>
              </div>
            </section>
          </div>

          <div className="lower-grid">
            <section className="panel readings-panel" id="readings">
              <div className="panel-heading">
                <div>
                  <div className="section-kicker">AUDIT TRAIL</div>
                  <h2>Recent temperature logs</h2>
                </div>
                <span className="count-chip">
                  Latest {recentReadings.length}
                </span>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>SHIPMENT / DEVICE</th>
                      <th>READING</th>
                      <th>RECORDED AT</th>
                      <th>INTEGRITY</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentReadings.map((r) => {
                      const s = shipmentById[r.shipment_id];
                      const bad =
                        s &&
                        (r.temperature < s.min_temp ||
                          r.temperature > s.max_temp);

                      return (
                        <tr key={r.id}>
                          <td>
                            <strong>{s?.shipment_code || r.shipment_id}</strong>
                            <span className="table-sub">
                              {r.device_id}
                              {r.simulated ? ' · simulated' : ''}
                            </span>
                          </td>

                          <td>
                            <span className={`reading-value ${bad ? 'hot' : ''}`}>
                              {Number(r.temperature).toFixed(1)}°C
                            </span>
                          </td>

                          <td>
                            <span className="table-time">
                              {fmtTime(r.recorded_at)}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`integrity-pill ${
                                verified[r.id] === 'valid'
                                  ? 'verified'
                                  : verified[r.id] === 'failed'
                                    ? 'failed'
                                    : ''
                              }`}
                            >
                              {verified[r.id] === 'valid' ? (
                                <CheckCircle2 size={13} />
                              ) : verified[r.id] === 'failed' ? (
                                <XCircle size={13} />
                              ) : (
                                <LockKeyhole size={13} />
                              )}

                              {verified[r.id] === 'valid'
                                ? 'Verified'
                                : verified[r.id] === 'failed'
                                  ? 'Failed'
                                  : 'Unverified'}
                            </span>
                          </td>

                          <td>
                            <button
                              className="text-button"
                              disabled={verified[r.id] === 'checking'}
                              onClick={() => void verify(r.id)}
                            >
                              {verified[r.id] === 'checking'
                                ? 'Checking…'
                                : 'Verify'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {!recentReadings.length && (
                  <div className="empty-state">
                    No temperature readings yet.
                  </div>
                )}
              </div>

              <div className="panel-footer">
                <span>
                  <LockKeyhole size={13} /> Verification checks hash and
                  server HMAC
                </span>
                <span className="footer-updated">
                  {data.mode === 'demo'
                    ? 'Browser demo data'
                    : 'Supabase database'}
                </span>
              </div>
            </section>

            <section className="panel alerts-panel" id="alerts">
              <div className="panel-heading">
                <div>
                  <div className="section-kicker">EXCEPTION MANAGEMENT</div>
                  <h2>Temperature alerts</h2>
                </div>

                <span
                  className={`alert-total ${
                    data.alerts.filter((a) => !a.resolved).length
                      ? 'has-alert'
                      : ''
                  }`}
                >
                  {data.alerts.filter((a) => !a.resolved).length} open
                </span>
              </div>

              <div className="alert-list">
                {data.alerts.slice(0, 5).map((a) => (
                  <div className="alert-row" key={a.id}>
                    <div className="alert-icon">
                      <AlertTriangle size={16} />
                    </div>

                    <div className="alert-body">
                      <strong>
                        {shipmentById[a.shipment_id]?.shipment_code ||
                          a.shipment_id}
                      </strong>
                      <p>{a.message}</p>
                      <span>
                        {timeAgo(a.created_at)} · {fmtTime(a.created_at)}
                      </span>
                    </div>

                    <span className="severity">
                      {a.severity.toUpperCase()}
                    </span>
                  </div>
                ))}

                {!data.alerts.length && (
                  <div className="empty-state">
                    No excursions detected.
                  </div>
                )}
              </div>

              <div className="alert-footnote">
                <AlertTriangle size={14} />
                Alert generated automatically when a reading exceeds
                shipment limits.
              </div>
            </section>
          </div>

          <section className="panel blockchain-panel" id="integrity">
            <div className="blockchain-copy">
              <div className="chain-emblem">
                <Database size={23} />
              </div>

              <div>
                <div className="section-kicker">ON-CHAIN EVIDENCE</div>
                <h2>Anchor the audit batch</h2>

                <p>
                  Write a digest of the current reading log to Sepolia.
                  The blockchain stores a fingerprint, not personal or raw
                  sensor data.
                </p>

                <div className="chain-status">
                  <span
                    className={
                      chainStatus === 'Anchored on chain' ? 'green' : ''
                    }
                  />
                  {chainStatus}

                  {wallet && (
                    <span className="wallet-address">
                      {' '}· {wallet.slice(0, 6)}…{wallet.slice(-4)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="chain-actions">
              <button
                className="button button-outline"
                onClick={() => void connectWallet()}
                disabled={busy}
              >
                <Wallet size={16} />
                {wallet ? 'Wallet connected' : 'Connect MetaMask'}
              </button>

              <button
                className="button button-primary"
                onClick={() => void anchorBatch()}
                disabled={busy || !data.readings.length}
              >
                <ShieldCheck size={16} />
                {busy ? 'Processing…' : 'Anchor current batch'}
              </button>

              <button
                className="button button-outline"
                onClick={() => void verifyBatchOnChain()}
                disabled={busy || !data.readings.length}
              >
                <ShieldCheck size={16} />
                Verify on blockchain
              </button>

              <span className="chain-network">
                {CONTRACT
                  ? `Contract ${CONTRACT.slice(0, 6)}…${CONTRACT.slice(-4)}`
                  : 'Contract not configured'}
                {chainStatus.startsWith('Sepolia connected')
                  ? ` · ${chainStatus}`
                  : ''}
              </span>
            </div>
          </section>

          <footer className="app-footer">
            <div>
              © 2026 Zyvex ColdChain Ledger <span>·</span> QUANTRIX 2K26
              prototype
            </div>

            <div>
              <span className="footer-lock">
                <LockKeyhole size={12} /> Integrity checks enabled
              </span>
              <span>Not a certified medical monitoring system</span>
            </div>
          </footer>
        </div>
      </section>
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
  note,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
  tint: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className={`stat-icon ${tint}`}>{icon}</div>
        <span className="stat-period">ALL TIME</span>
      </div>

      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-note">{note}</div>
    </div>
  );
}
