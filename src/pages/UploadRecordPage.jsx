import { useState, useEffect } from 'react';
import Select from 'react-select';
import api from '../api';
import styles from './FormPage.module.css';

export default function UploadRecordPage() {
  const [form, setForm] = useState({
    name: '',
    organization_name: '',
    title: '',
    date: '',
    summary: '',
  });
  const [jurisdiction, setJurisdiction] = useState(null);
  const [agency, setAgency] = useState(null);
  const [tags, setTags] = useState([]);
  const [agencyOptions, setAgencyOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [referenceId, setReferenceId] = useState('');

  const jurisdictionOptions = [
    { value: 'Federal', label: 'Federal' },
    { value: 'California', label: 'California' },
    { value: 'New York', label: 'New York' },
    { value: 'Texas', label: 'Texas' },
  ];

  useEffect(() => {
    api.get('/retrive_data').then(res => {
      if (res.data.status === 'success') {
        const agencies = res.data.agency_list;
        const opts = Object.entries(agencies).flatMap(([jur, names]) =>
          names.map(name => ({ value: name, label: name, jurisdiction: jur }))
        );
        setAgencyOptions(opts);
        setTagOptions(res.data.tags_list.map(t => ({ value: t.id, label: t.name })));
      }
    }).catch(() => {});
  }, []);

  const filteredAgencies = jurisdiction
    ? agencyOptions.filter(a => a.jurisdiction === jurisdiction.value)
    : agencyOptions;

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.date || !jurisdiction || !agency || !form.summary) {
      setStatus({ type: 'error', msg: 'Please fill in all required fields.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await api.post('/submit_record', {
        ...form,
        jurisdiction,
        agency,
        tags,
      });
      if (res.data.status === 'success') {
        setReferenceId(res.data.reference_id);
        setStatus({ type: 'success', msg: `Record submitted! Reference ID: ${res.data.reference_id}` });
        setForm({ name: '', organization_name: '', title: '', date: '', summary: '' });
        setJurisdiction(null);
        setAgency(null);
        setTags([]);
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
          <span className={styles.headerIcon}>🗃</span>
          <h1 className={styles.title}>FOIA Request Record Upload</h1>
        </div>

        {status && (
          <div className={`${styles.alert} ${status.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
            {status.msg}
            {status.type === 'success' && referenceId && (
              <div className={styles.refId}>
                Save this reference ID: <strong>{referenceId}</strong>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Personal Details</div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Name</label>
                <input
                  className={styles.input}
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Organization Name</label>
                <input
                  className={styles.input}
                  name="organization_name"
                  placeholder="Organization"
                  value={form.organization_name}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionLabel}>Record Details</div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Title <span className={styles.required}>*</span></label>
                <input
                  className={styles.input}
                  name="title"
                  placeholder="Title"
                  value={form.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Date <span className={styles.required}>*</span></label>
                <input
                  className={styles.input}
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Jurisdiction <span className={styles.required}>*</span></label>
                <Select
                  options={jurisdictionOptions}
                  value={jurisdiction}
                  onChange={val => { setJurisdiction(val); setAgency(null); }}
                  placeholder="Select Jurisdiction"
                  styles={selectStyles}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.fieldLabel}>Agency <span className={styles.required}>*</span></label>
                <Select
                  options={filteredAgencies}
                  value={agency}
                  onChange={setAgency}
                  isDisabled={!jurisdiction}
                  placeholder={jurisdiction ? 'Select agency' : 'Select jurisdiction first'}
                  styles={selectStyles}
                />
              </div>
            </div>

            <div className={styles.fieldFull}>
              <label className={styles.fieldLabel}>Tags</label>
              <Select
                options={tagOptions}
                value={tags}
                onChange={setTags}
                isMulti
                placeholder="Select tags"
                styles={selectStyles}
              />
            </div>

            <div className={styles.fieldFull}>
              <label className={styles.fieldLabel}>Summary / details of request <span className={styles.required}>*</span></label>
              <textarea
                className={styles.textarea}
                name="summary"
                placeholder="Describe the FOIA request…"
                value={form.summary}
                onChange={handleChange}
                required
                rows={5}
              />
            </div>
          </div>

          <button className={styles.submitBtn} type="submit" disabled={loading}>
            {loading ? 'Submitting…' : 'Submit Record'}
          </button>
        </form>
      </div>
    </div>
  );
}

const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderColor: state.isFocused ? '#f5c800' : '#e0e0e0',
    borderRadius: 8,
    boxShadow: state.isFocused ? '0 0 0 2px rgba(245,200,0,0.2)' : 'none',
    fontSize: 14,
    '&:hover': { borderColor: '#bbb' },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: 14,
    background: state.isSelected ? '#f5c800' : state.isFocused ? '#fffbe6' : '#fff',
    color: '#111',
  }),
};
