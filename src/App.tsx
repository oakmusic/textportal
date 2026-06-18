import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Send from './pages/Send';
import Receive from './pages/Receive';
import DirectReceive from './pages/DirectReceive';
import Admin from './pages/Admin';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/send" element={<Send />} />
        <Route path="/receive" element={<Receive />} />
        <Route path="/r/:code" element={<DirectReceive />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Layout>
  );
}

export default App;
