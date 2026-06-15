import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from '@/pages/Home';
import Garden from '@/pages/Garden';
import Flight from '@/pages/Flight';
import About from '@/pages/About';
import NotFound from '@/pages/NotFound';
import { Navbar } from '@/components/layout/Navbar';
import { CustomCursor } from '@/components/layout/CustomCursor';
import { PageTransition } from '@/components/layout/PageTransition';

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <Home />
            </PageTransition>
          }
        />
        <Route
          path="/garden"
          element={
            <PageTransition>
              <Garden />
            </PageTransition>
          }
        />
        <Route
          path="/flight"
          element={
            <PageTransition>
              <Flight />
            </PageTransition>
          }
        />
        <Route
          path="/about"
          element={
            <PageTransition>
              <About />
            </PageTransition>
          }
        />
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

export default function App() {
  return (
    <Router>
      <div className="w-full min-h-screen relative">
        <CustomCursor />
        <Navbar />
        <AnimatedRoutes />
      </div>
    </Router>
  );
}
