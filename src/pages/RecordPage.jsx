import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import styles from './RecordPage.module.css';

const RESPONSIVENESS_LABELS = {
  1: 'Unresponsive',
  2: 'Mostly Unresponsive',
  3: 'Partially Responsive',
  4: 'Mostly Responsive',
  5: 'Fully Responsive',
};

const RESPONSIVENESS_COLORS = {
  1: '#ef4444',
  2: '#f97316',
  3: '#eab308',
  4: '#84cc16',
  5: '#22c55e',
};

export default function RecordPage() {
  const { referenceId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get(`/record?reference_id=${referenceId}`)
      .then(res => {
        if (res.data && res.data.request) {
          setData(res.data);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [referenceId]);

  if (loading) return <div className={styles.center}>Loading…</div>;
  if (error || !data) return (
    <div className={styles.center}>
      <p>Record not found.</p>
      <Link to="/search" className={styles.backLink}>← Back to search</Link>
    </div>
  );

  const { request, response } = data;
  const rating = response?.responsiveness_rating;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/search" className={styles.backLink}>← Back to search</Link>

        <div className={styles.titleRow}>
          <h1 className={styles.title}>{request.title}</h1>
          {rating && (
            <span
              className={styles.badge}
              style={{
                background: RESPONSIVENESS_COLORS[rating] + '22',
                color: RESPONSIVENESS_COLORS[rating],
              }}
            >
              {RESPONSIVENESS_LABELS[rating]}
            </span>
          )}
        </div>

        <div className={styles.meta}>
          {request.jurisdiction && <span className={styles.metaItem}>📍 {request.jurisdiction}</span>}
          {request.agency && <span className={styles.metaItem}>🏛 {request.agency}</span>}
          {request.created_at && (
            <span className={styles.metaItem}>
              📅 Submitted {new Date(request.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          )}
        </div>

        {request.tags?.length > 0 && (
          <div className={styles.tags}>
            {request.tags.map(tag => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        )}

        <div className={styles.grid}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Request</h2>
            {(request.name || request.organization_name) && (
              <div className={styles.cardMeta}>
                <span>Submitted by: <strong>{[request.name, request.organization_name].filter(Boolean).join(', ')}</strong></span>
              </div>
            )}
            <p className={styles.summary}>{request.summary}</p>
          </section>

          {response ? (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Government Response</h2>
              <div className={styles.responseStats}>
                <div className={styles.stat}>
                  <div className={styles.statValue}>{response.days_to_response}</div>
                  <div className={styles.statLabel}>Days to respond</div>
                </div>
                <div className={styles.stat}>
                  <div
                    className={styles.statValue}
                    style={{ color: RESPONSIVENESS_COLORS[response.responsiveness_rating] }}
                  >
                    {response.responsiveness_rating}/5
                  </div>
                  <div className={styles.statLabel}>Responsiveness</div>
                </div>
                {response.date && (
                  <div className={styles.stat}>
                    <div className={styles.statValue}>
                      {new Date(response.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <div className={styles.statLabel}>Response date</div>
                  </div>
                )}
              </div>
              <p className={styles.summary}>{response.summary}</p>
            </section>
          ) : (
            <section className={`${styles.card} ${styles.cardEmpty}`}>
              <h2 className={styles.cardTitle}>Government Response</h2>
              <p className={styles.emptyText}>No response linked yet.</p>
              <Link to="/link-response" className={styles.linkBtn}>Link a response →</Link>
            </section>
          )}
        </div>

        <div className={styles.refRow}>
          <span className={styles.refLabel}>Reference ID:</span>
          <code className={styles.refCode}>{referenceId}</code>
        </div>
      </div>
    </div>
  );
}
