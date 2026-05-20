import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import SearchPage from './pages/SearchPage';
import UploadRecordPage from './pages/UploadRecordPage';
import LinkResponsePage from './pages/LinkResponsePage';
import RecordPage from './pages/RecordPage';
import FeedbackPage from './pages/FeedbackPage';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/upload-record" element={<UploadRecordPage />} />
        <Route path="/link-response" element={<LinkResponsePage />} />
        <Route path="/record/:referenceId" element={<RecordPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
      </Routes>
    </>
  );
}
