import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';

const NavigationHeader = ({ title, showBackButton = false, backUrl = '/' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <Card className="mb-3 top-panel">
      <Card.Body className="py-3">
        <div className="d-flex justify-content-between align-items-center">
          <h1 className="mb-0 month-title">{title}</h1>

          {showBackButton ? (
            <div className="d-flex gap-2 top-buttons">
              <Button variant="light" onClick={() => navigate(backUrl)}>
                ← Назад
              </Button>
            </div>
          ) : (
            <div className="d-flex gap-2 top-buttons">
              <Button variant="light" onClick={() => navigate('/reports')}>
                📊 Отчеты
              </Button>
              <Button variant="light" onClick={() => navigate('/schedule')}>
                📈 График
              </Button>
              <Button variant="light" onClick={() => {}}>
                💰 Касса
              </Button>
              <Button variant="light" onClick={() => navigate('/settings')}>
                ⚙️ Настройки
              </Button>
              {!isHome && (
                <Button variant="light" onClick={() => navigate('/')} title="Главная" className="home-btn">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                  </svg>
                </Button>
              )}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default NavigationHeader;