import { Route, Switch } from 'wouter';
import { Layout } from '@/components/Layout.tsx';
import { HomePage } from '@/pages/HomePage.tsx';
import { ResultsPage } from '@/pages/ResultsPage.tsx';

function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/results" component={ResultsPage} />
      </Switch>
    </Layout>
  );
}

export default App;
