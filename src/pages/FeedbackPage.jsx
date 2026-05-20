import { useState } from 'react';
import api from '../api';
import styles from './FormPage.module.css';

const TYPE_OPTIONS = [
  { value: 'bug', label: '🐛 Bug report' },
  { value: 'idea', label: '💡 Feature idea' },
  { value: 'other', label: '💬 Other' },
];

export default function FeedbackPage() {
  const [form, setForm] = useState({ name: '', email: '', type: 'idea', message: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.message.trim()) {
      setStatus({ type: 'error', msg: 'Please enter a message.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.post('/submit_feedback', form);
      if (res.data.status === 'success') {
        setStatus({ type: 'success', msg: 'Thanks! Your feedback was submitted.' });
        setForm({ name: '', email: '', type: 'idea', message: '' });
      } else {
        setStatus({ type: 'error', msg: 'Submission failed. Please try again.' });
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
          <span className={styles.headerIcon}>💬</span>
          <h1 className={styles.title}>Share Your Ideas</h1>
        </div>
        <p style={{ fontSize: 14, color: '#666', marginBottom: 24, lineHeight: 1.6 }}>
          We're in beta and actively improving the site. Found a bug? Have a feature idea?
          We want to hear it.
        </p>

        {status && (
          <div className={`${styles.alert} ${status.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
            {status.msg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.section}>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Name</label>
                <input
                  className={styles.input}
                  name="name"
                  placeholder="Your name (optional)"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Email</label>
                <input
                  className={styles.input}
                  type="email"
                  name="email"
                  placeholder="your@email.com (optional)"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className={styles.fieldFull}>
              <label className={styles.fieldLabel}>Type</label>
              <select className={styles.input} name="type" value={form.type} onChange={handleChange}>
                {TYPE_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            <div className={styles.fieldFull}>
              <label className={styles.fieldLabel}>Message <span className={styles.required}>*</span></label>
              <textarea
                className={styles.textarea}
                name="message"
                placeholder="Tell us what you think…"
                value={form.message}
                onChange={handleChange}
                required
                rows={6}
              />
            </div>
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Sending…' : 'Submit Feedback'}
          </button>
        </form>
      </div>
    </div>
  );
}
