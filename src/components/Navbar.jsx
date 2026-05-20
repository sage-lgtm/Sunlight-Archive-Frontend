import { NavLink } from 'react-router-dom';
import styles from './Navbar.module.css';

export default function Navbar() {
  return (
    <nav className={styles.nav}>
      <NavLink to="/search" className={styles.brand}>
        <span className={styles.logo}>☀️</span>
        <span className={styles.brandName}>Sunlight Archive</span>
      </NavLink>
      <div className={styles.links}>
        <NavLink to="/search" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          Search
        </NavLink>
        <NavLink to="/upload-record" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          Upload Record
        </NavLink>
        <NavLink to="/link-response" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          Link Response
        </NavLink>
        <NavLink to="/feedback" className={({ isActive }) => isActive ? `${styles.link} ${styles.active}` : styles.link}>
          Feedback
        </NavLink>
      </div>
    </nav>
  );
}
