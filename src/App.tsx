import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import TrainingPage from './pages/TrainingPage';

type Page = 'landing' | 'dashboard' | 'training';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  const navigate = useCallback((page: string) => {
    setCurrentPage(page as Page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPage}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {currentPage === 'landing' && <LandingPage onNavigate={navigate} />}
        {currentPage === 'dashboard' && <Dashboard onNavigate={navigate} />}
        {currentPage === 'training' && <TrainingPage onNavigate={navigate} />}
      </motion.div>
    </AnimatePresence>
  );
}
