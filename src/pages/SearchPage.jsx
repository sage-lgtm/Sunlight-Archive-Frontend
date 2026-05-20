import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import api from '../api';
import styles from './SearchPage.module.css';

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

export default function SearchPage() {
  const [keyword, setKeyword] = useState('');
  const [jurisdiction, setJurisdiction] = useState(null);
  const [agency, setAgency] = useState(null);
  const [tags, setTags] = useState([]);
  const [agencyOptions, setAgencyOptions] = useState([]);
  const [tagOptions, setTagOptions] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

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
        const opts = Object.entries(agencies).flatMap(([jurisdiction, names]) =>
          names.map(name => ({ value: name, label: name, jurisdiction }))
        );
        setAgencyOptions(opts);

        const tagOpts = res.data.tags_list.map(t => ({ value: t.id, label: t.name }));
        setTagOptions(tagOpts);
      }
    }).catch(() => {});
  }, []);

  const filteredAgencies = jurisdiction
    ? agencyOptions.filter(a => a.jurisdiction === jurisdiction.value)
    : agencyOptions;

  async function handleSearch(e) {
    e?.preventDefault();
    const hasFilters = keyword || jurisdiction || agency || tags.length;
    if (!hasFilters) return;
    setLoading(true);
    setSearched(true);
    try {
      const res = await api.post('/search', {
        keyword: keyword || null,
        jurisdiction: jurisdiction || null,
        agency: agency || null,
        tags: tags.length ? tags : null,
        limit: 20,
        offset: 0,
      });
      setResults(Array.isArray(res.data) ? res.data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarInner}>
          <h3 className={styles.sidebarTitle}>Filters</h3>

          <label className={styles.label}>Jurisdiction</label>
          <Select
            options={jurisdictionOptions}
            value={jurisdiction}
            onChange={val => { setJurisdiction(val); setAgency(null); }}
            isClearable
            placeholder="Select jurisdiction"
            styles={selectStyles}
          />

          <label className={styles.label}>Agency</label>
          <Select
            options={filteredAgencies}
            value={agency}
            onChange={setAgency}
            isClearable
            isDisabled={!jurisdiction}
            placeholder={jurisdiction ? 'Select agency' : 'Select jurisdiction first'}
            styles={selectStyles}
          />

          <label className={styles.label}>Tags</label>
          <Select
            options={tagOptions}
            value={tags}
            onChange={setTags}
            isMulti
            placeholder="Select tags"
            styles={selectStyles}
          />
        </div>
      </aside>

      <main className={styles.main}>
        <form className={styles.searchBar} onSubmit={handleSearch}>
          <input
            className={styles.input}
            type="text"
            placeholder="Search FOIA records…"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <button className={styles.searchBtn} type="submit">Search</button>
        </form>

        {loading && <p className={styles.status}>Searching…</p>}

        {!loading && searched && results.length === 0 && (
          <p className={styles.status}>No results found.</p>
        )}

        {!loading && !searched && (
          <p className={styles.hint}>Enter a keyword or select filters to search.</p>
        )}

        <div className={styles.results}>
          {results.map(r => (
            <div
              key={r.reference_id}
              className={styles.card}
              onClick={() => navigate(`/record/${r.reference_id}`)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.cardTitle}>{r.title}</span>
                {r.responsiveness_rating && (
                  <span
                    className={styles.badge}
                    style={{ background: RESPONSIVENESS_COLORS[r.responsiveness_rating] + '22', color: RESPONSIVENESS_COLORS[r.responsiveness_rating] }}
                  >
                    {RESPONSIVENESS_LABELS[r.responsiveness_rating]}
                  </span>
                )}
              </div>
              <div className={styles.cardMeta}>
                {r.jurisdiction && <span className={styles.metaItem}>📍 {r.jurisdiction}</span>}
                {r.agency && <span className={styles.metaItem}>🏛 {r.agency}</span>}
                {r.created_at && (
                  <span className={styles.metaItem}>
                    📅 {new Date(r.created_at).toLocaleDateString()}
                  </span>
                )}
              </div>
              {r.request_summary && (
                <p className={styles.cardSummary}>{r.request_summary}</p>
              )}
              {r.tags && r.tags.length > 0 && (
                <div className={styles.tags}>
                  {(Array.isArray(r.tags) ? r.tags : r.tags.split(',')).map(tag => (
                    <span key={tag} className={styles.tag}>{tag.trim()}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

const selectStyles = {
  control: (base) => ({
    ...base,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    boxShadow: 'none',
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
