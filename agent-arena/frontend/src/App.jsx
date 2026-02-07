import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Battle from './pages/Battle';
import Market from './pages/Market';
import Community from './pages/Community';
import Season from './pages/Season';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/battle" element={<Battle />} />
          <Route path="/market" element={<Market />} />
          <Route path="/community" element={<Community />} />
          <Route path="/season" element={<Season />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
