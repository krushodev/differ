import { Route, Switch, useLocation } from 'wouter';
import { AnimatePresence, motion } from 'framer-motion';
import { Layout } from '@/components/Layout.tsx';
import { HomePage } from '@/pages/HomePage.tsx';
import { ResultsPage } from '@/pages/ResultsPage.tsx';
import { SingleFilePage } from '@/pages/SingleFilePage.tsx';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 }
};

function App() {
  const [location] = useLocation();

  return (
    <Layout>
      <AnimatePresence mode="wait">
        <motion.div key={location} variants={pageVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25, ease: 'easeInOut' }}>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/results" component={ResultsPage} />
            <Route path="/single" component={SingleFilePage} />
          </Switch>
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

export default App;
