import { Link } from 'react-router-dom';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.sunWrap}>
          <span className={styles.sun}>☀️</span>
        </div>
        <h1 className={styles.heading}>Sunlight Archive</h1>
        <p className={styles.tagline}>
          Welcome to the animal rights movement's public records requests repository.
        </p>
        <p className={styles.body}>
          This exists to reduce request redundancies, increase transparency, prevent data loss,
          and make us all better sleuths.
        </p>
        <p className={styles.beta}>
          We're in beta — please{' '}
          <Link to="/feedback" className={styles.feedbackLink}>
            share ideas on how to improve the site here
          </Link>
          .
        </p>
        <div className={styles.actions}>
          <Link to="/search" className={styles.btnPrimary}>Search Records</Link>
          <Link to="/upload-record" className={styles.btnSecondary}>Upload a Record</Link>
        </div>
      </div>

      <div className={styles.features}>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>🔍</span>
          <h3 className={styles.featureTitle}>Search</h3>
          <p className={styles.featureDesc}>Find FOIA requests by keyword, agency, jurisdiction, or tag.</p>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>📤</span>
          <h3 className={styles.featureTitle}>Upload</h3>
          <p className={styles.featureDesc}>Add your own public records requests to the archive.</p>
        </div>
        <div className={styles.feature}>
          <span className={styles.featureIcon}>🔗</span>
          <h3 className={styles.featureTitle}>Link Responses</h3>
          <p className={styles.featureDesc}>Attach government responses to requests so the record is complete.</p>
        </div>
      </div>
    </div>
  );
}
