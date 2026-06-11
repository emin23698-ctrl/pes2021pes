import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';

// Sayfaları (Pages) İçeri Aktarma
import Dashboard from './pages/Dashboard';
import DrawTeams from './pages/DrawTeams';
import AddResult from './pages/AddResult';
import History from './pages/History';
import Players from './pages/Players';
import Teams from './pages/Teams';

import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/draw" element={<DrawTeams />} />
            <Route path="/add-result" element={<AddResult />} />
            <Route path="/history" element={<History />} />
            <Route path="/players" element={<Players />} />
            <Route path="/teams" element={<Teams />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;