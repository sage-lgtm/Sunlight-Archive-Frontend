import { useState } from 'react';
import api from '../api';
import styles from './FormPage.module.css';

const RESPONSIVENESS_OPTIONS = [
  { value: 1, label: '1 — Unresponsive' },
  { value: 2, label: '2 — Mostly Unresponsive' },
  { value: 3, label: '3 — Partially Responsive' },
  { value: 4, label: '4 — Mostly Responsive' },
  { value: 5, label: '5 — Fully Responsive' },
];

export default function LinkResponsePage() {
  const [step, setStep] = useState(1);
  const [referenceId, setReferenceId] = useState('');
  const [checkResult, setCheckResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [form, setForm] = useState({ date: '', summary: '', responsiveness_rating: '', days_to_response: '' });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleCheck(e) {
    e.preventDefault();
    if (!referenceId.trim()) return;
    setChecking(true);
    setCheckResult(null);
    try {
      const res = await api.post('/response_linked', { reference_id: referenceId.trim() });
      setCheckResult(res.data);
      if (res.data.status === 'success' && !res.data.exists && res.data.msg === 'Record Found') {
        setStep(2);
      }
    } catch {
      setCheckResult({ status: 'failed', msg: 'Server error.' });
    } finally {
      setChecking(false);
    }
  }

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) { setStatus({ type: 'error', msg: 'Please attach a PDF file.' }); return; }
    if (!form.date || !form.summary || !form.responsiveness_rating || !form.days_to_response) {
      setStatus({ type: 'error', msg: 'Please fill in all fields.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    const fd = new FormData();
    fd.append('reference_id', referenceId.trim());
    fd.append('date', form.date);
    fd.append('summary', form.summary);
    fd.append('responsiveness_rating', Number(form.responsiveness_rating));
    fd.append('days_to_response', Number(form.days_to_response));
    fd.append('file', file);
    try {
      const res = await api.post('/link-response', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.status === 'success') {
        setStatus({ type: 'success', msg: `Response linked to record ${res.data.reference_id}!` });
        setStep(1);
        setReferenceId('');
        setForm({ date: '', summary: '', responsiveness_rating: '', days_to_response: '' });
        setFile(null);
        setCheckResult(null);
      } else {
        setStatus({ type: 'error', msg: res.data.msg || 'Failed to link response.' });
      }
    } catch {
      setStatus({ type: 'error', msg: 'Server error. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.headerIcon}>🔗</span>
          <h1 className={styles.title}>Link Government Response</h1>
        </div>

        {status && (
          <div className={`${styles.alert} ${status.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
            {status.msg}
          </div>
        )}

        {/* Step 1: verify reference ID */}
        <div className={styles.section}>
          <div className={styles.sectionLabel}>Step 1 — Find Record</div>
          <form onSubmit={handleCheck} style={{ display: 'flex', gap: 10 }}>
            <input
              className={styles.input}
              placeholder="Enter reference ID"
              value={referenceId}
              onChange={e => setReferenceId(e.target.value)}
              disabled={step === 2}
            />
            <button
              className={styles.submitBtn}
              type="submit"
              disabled={checking || step === 2}
              style={{ width: 'auto', padding: '10px 20px', marginTop: 0 }}
            >
              {checking ? 'Checking…' : 'Check'}
            </button>
            {step === 2 && (
              <button
                type="button"
                className={styles.submitBtn}
                style={{ width: 'auto', padding: '10px 20px', marginTop: 0, background: '#f0f0f0', color: '#333' }}
                onClick={() => { setStep(1); setCheckResult(null); }}
              >
                Change
              </button>
            )}
          </form>
          {checkResult && checkResult.status === 'success' && checkResult.exists && (
            <p style={{ color: '#f97316', marginTop: 8, fontSize: 14 }}>⚠️ A response is already linked to this record.</p>
          )}
          {checkResult && checkResult.msg === 'Record Not Found!' && (
            <p style={{ color: '#ef4444', marginTop: 8, fontSize: 14 }}>❌ No record found with that ID.</p>
          )}
          {checkResult && !checkResult.exists && checkResult.msg === 'Record Found' && (
            <p style={{ color: '#22c55e', marginTop: 8, fontSize: 14 }}>✅ Record found. Fill in the response details below.</p>
          )}
        </div>

        {/* Step 2: response details */}
        {step === 2 && (
          <form onSubmit={handleSubmit}>
            <div className={styles.section}>
              <div className={styles.sectionLabel}>Step 2 — Response Details</div>

              <div className={styles.row}>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Response Date <span className={styles.required}>*</span></label>
                  <input className={styles.input} type="date" name="date" value={form.date} onChange={handleChange} required />
                </div>
                <div className={styles.field}>
                  <label className={styles.fieldLabel}>Days to Response <span className={styles.required}>*</span></label>
                  <input className={styles.input} type="number" name="days_to_response" placeholder="e.g. 45" value={form.days_to_response} onChange={handleChange} required min={0} />
                </div>
              </div>

              <div className={styles.fieldFull}>
                <label className={styles.fieldLabel}>Responsiveness Rating <span className={styles.required}>*</span></label>
                <select className={styles.input} name="responsiveness_rating" value={form.responsiveness_rating} onChange={handleChange} required>
                  <option value="">Select rating…</option>
                  {RESPONSIVENESS_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.fieldFull}>
                <label className={styles.fieldLabel}>Summary of response <span className={styles.required}>*</span></label>
                <textarea className={styles.textarea} name="summary" placeholder="Describe the government's response…" value={form.summary} onChange={handleChange} required rows={4} />
              </div>

              <div className={styles.fieldFull}>
                <label className={styles.fieldLabel}>Response Document (PDF) <span className={styles.required}>*</span></label>
                <input
                  className={styles.input}
                  type="file"
                  accept=".pdf"
                  onChange={e => setFile(e.target.files[0])}
                  required
                  style={{ padding: '8px 10px' }}
                />
                {file && <span style={{ fontSize: 13, color: '#666', marginTop: 4 }}>📎 {file.name}</span>}
              </div>
            </div>

            <button className={styles.submitBtn} type="submit" disabled={loading}>
              {loading ? 'Uploading…' : 'Link Response'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
