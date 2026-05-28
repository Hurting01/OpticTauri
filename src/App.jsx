import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Dashboard from './Dashboard';
import DaySheet from './DaySheet';
import Reports from './Reports';
import Settings from './Settings';

function App() {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  return (
    <Router>
      <div className="dashboard-container">
        <Container fluid className="p-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route 
              path="/day/:day" 
              element={
                <DaySheet 
                  month={currentMonth}
                  year={currentYear}
                />
              } 
            />
            <Route 
              path="/reports" 
              element={
                <Reports 
                  month={currentMonth}
                  year={currentYear}
                />
              } 
            />
            <Route 
              path="/settings" 
              element={<Settings />} 
            />
          </Routes>
        </Container>
      </div>
    </Router>
  );
}

export default App;
