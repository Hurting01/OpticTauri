import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Nav, Button, Form } from 'react-bootstrap';
import EmployeesService from './employeesService';

const Reports = ({ month, year }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('bonus');
  const [settings, setSettings] = useState({
    salaryConsultant: 37500,
    salaryOptometrist: 40000
  });
  const [employees, setEmployees] = useState([]);
  const [bonusData, setBonusData] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [conversionData, setConversionData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [saveStatus, setSaveStatus] = useState(null);

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  // === Функции загрузки ===

  const loadSettings = async () => {
    const savedSettings = await window.electronAPI.getSettings();
    if (savedSettings) {
      setSettings(savedSettings);
    }
  };

  const loadEmployees = async () => {
    const employeesList = await EmployeesService.getEmployees();
    setEmployees(employeesList);
  };

  const loadInitialData = async () => {
    await Promise.all([
      loadSettings(),
      loadEmployees()
    ]);
  };

  const loadBonusData = async () => {
    try {
      const savedData = await window.electronAPI.getBonusReport(month, year);
      if (savedData && savedData.data && savedData.data.length > 0) {
        setBonusData(savedData.data);
      } else {
        const daysInMonth = new Date(year, month, 0).getDate();
        const data = [];
        for (let day = 1; day <= daysInMonth; day++) {
          const dayData = { day };
          if (employees && employees.length > 0) {
            employees.forEach(emp => {
              if (emp.fullName && emp.isActive !== false) {
                dayData[emp.fullName] = Math.random() > 0.3 ? (Math.random() * 1000).toFixed(2) : 0;
              }
            });
          }
          data.push(dayData);
        }
        setBonusData(data);
        await window.electronAPI.saveBonusReport(month, year, { month, year, data });
      }
    } catch (error) {
      console.error('Error loading bonus data:', error);
    }
  };

  const loadSalaryData = async () => {
    try {
      const savedData = await window.electronAPI.getSalaryReport(month, year);
      if (savedData && savedData.data && savedData.data.length > 0) {
        setSalaryData(savedData.data);
      } else {
        const data = [
          { name: 'Письминская Ю.', base: 37500, bonus: 11795.47, extra: 8000, total: 54920.47 },
          { name: 'Каргина Е.', base: 37500, bonus: 11795.47, extra: 8000, total: 54920.47 },
          { name: 'Липенкова Т.', base: 40000, bonus: 12000, extra: 5000, total: 57000 },
          { name: 'Машалова Т.', base: 37500, bonus: 11795.47, extra: 8000, total: 54920.47 }
        ];
        setSalaryData(data);
        await window.electronAPI.saveSalaryReport(month, year, { month, year, data });
      }
    } catch (error) {
      console.error('Error loading salary data:', error);
    }
  };

  const loadConversionData = async () => {
    try {
      const savedData = await window.electronAPI.getConversionReport(month, year);
      if (savedData && savedData.data && savedData.data.length > 0) {
        setConversionData(savedData.data);
      } else {
        const data = [
          { date: '01.03.2026', employees: 'Письминская Ю./Машалова Т.', visitors: 17, sales: 3, conversion: 17.6, orders: 0, diagnostics: 1 },
          { date: '02.03.2026', employees: 'Каргина Е./Липенкова Т.', visitors: 12, sales: 2, conversion: 16.7, orders: 1, diagnostics: 0 }
        ];
        setConversionData(data);
        await window.electronAPI.saveConversionReport(month, year, { month, year, data });
      }
    } catch (error) {
      console.error('Error loading conversion data:', error);
    }
  };

  const loadOrdersData = async () => {
    try {
      const savedData = await window.electronAPI.getOrdersReport(month, year);
      if (savedData && savedData.data && savedData.data.length > 0) {
        setOrdersData(savedData.data);
      } else {
        const data = [
          { id: 1, item: 'Очки солнцезащитные', status: '✓' },
          { id: 2, item: 'Линзы контактные', status: '✗' },
          { id: 3, item: 'Оправа пластиковая', status: '✓' }
        ];
        setOrdersData(data);
        await window.electronAPI.saveOrdersReport(month, year, { month, year, data });
      }
    } catch (error) {
      console.error('Error loading orders data:', error);
    }
  };

  // === Обработчики изменений ===

  const handleBonusChange = (dayIdx, empName, value) => {
    const newData = [...bonusData];
    newData[dayIdx][empName] = value;
    setBonusData(newData);
  };

  // === Загрузка данных ===

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadBonusData();
  }, [employees, month, year]);

  // Автосохранение бонусов
  useEffect(() => {
    if (bonusData.length > 0) {
      const timer = setTimeout(() => {
        window.electronAPI.saveBonusReport(month, year, { month, year, data: bonusData });
        setSaveStatus('bonus');
        setTimeout(() => setSaveStatus(null), 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [bonusData, month, year]);

  // Автосохранение конверсии
  useEffect(() => {
    if (conversionData.length > 0) {
      const timer = setTimeout(() => {
        window.electronAPI.saveConversionReport(month, year, { month, year, data: conversionData });
        setSaveStatus('conversion');
        setTimeout(() => setSaveStatus(null), 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [conversionData, month, year]);

  // Автосохранение заказов
  useEffect(() => {
    if (ordersData.length > 0) {
      const timer = setTimeout(() => {
        window.electronAPI.saveOrdersReport(month, year, { month, year, data: ordersData });
        setSaveStatus('orders');
        setTimeout(() => setSaveStatus(null), 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [ordersData, month, year]);

  // Загрузка остальных данных при смене месяца/года
  useEffect(() => {
    loadSalaryData();
    loadConversionData();
    loadOrdersData();
  }, [month, year]);

  return (
    <div className="p-4 fade-in">
      {/* Заголовок */}
      <Card className="mb-3 top-panel">
        <Card.Body className="py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0 month-title">📊 Отчеты</h1>

            <div className="d-flex gap-2 top-buttons">
              <Button variant="light" onClick={() => navigate('/reports')}>
                📊 Отчеты
              </Button>
              <Button variant="light" onClick={() => {}}>
                📈 График
              </Button>
              <Button variant="light" onClick={() => {}}>
                💰 Касса
              </Button>
              <Button variant="light" onClick={() => navigate('/settings')}>
                ⚙️ Настройки
              </Button>
              <Button variant="light" onClick={() => navigate('/')} title="Главная" className="home-btn">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Навигация по отчетам */}
      <Nav variant="tabs" className="mb-3 reports-nav">
        <Nav.Item>
          <Nav.Link active={activeTab === 'bonus'} onClick={() => setActiveTab('bonus')}>
            💰 Бонусы
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={activeTab === 'salary'} onClick={() => setActiveTab('salary')}>
            💵 ЗП
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={activeTab === 'conversion'} onClick={() => setActiveTab('conversion')}>
            📈 Конверсия
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>
            📦 Заказы
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Бонусы */}
      {activeTab === 'bonus' && (
        <Card>
          <Card.Header className="app-header d-flex justify-content-between align-items-center">
            <span>📋 Итоги бонусов по продажам за {monthNames[month - 1]} {year}</span>
            {saveStatus === 'bonus' && (
              <span className="text-success small">✓ Сохранено</span>
            )}
          </Card.Header>
          <Card.Body>
            {(!employees || employees.filter(emp => emp.fullName).length === 0) ? (
              <div className="text-center text-muted py-5">
                <p className="mb-0">Сотрудники не указаны</p>
                <small>Добавьте сотрудников в настройках</small>
              </div>
            ) : (
              <Table striped bordered hover className="bonus-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>День</th>
                    {employees.filter(emp => emp.fullName).map((emp) => (
                      <th key={emp.id}>{emp.fullName}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bonusData.map((dayData, idx) => (
                    <tr key={idx}>
                      <td className="text-center">{dayData.day}</td>
                      {employees.filter(emp => emp.fullName).map((emp) => (
                        <td key={emp.id} className="text-center p-1">
                          <Form.Control
                            type="text"
                            size="sm"
                            value={dayData[emp.fullName] || ''}
                            onChange={(e) => handleBonusChange(idx, emp.fullName, e.target.value)}
                            className="bonus-input"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

      {/* ЗП */}
      {activeTab === 'salary' && (
        <Card>
          <Card.Header className="app-header">💵 Заработная плата за {monthNames[month - 1]} {year}</Card.Header>
          <Card.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ФИО</th>
                  <th>Оклад (₽)</th>
                  <th>Бонусы (₽)</th>
                  <th>Доп. выплаты (₽)</th>
                  <th>Итог (₽)</th>
                </tr>
              </thead>
              <tbody>
                {salaryData.map((emp, idx) => (
                  <tr key={idx}>
                    <td>{emp.name}</td>
                    <td>{emp.base.toLocaleString()}</td>
                    <td>{emp.bonus.toLocaleString()}</td>
                    <td>{emp.extra.toLocaleString()}</td>
                    <td><strong>{emp.total.toLocaleString()}</strong></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Конверсия */}
      {activeTab === 'conversion' && (
        <Card>
          <Card.Header className="app-header">📈 Конверсия продаж</Card.Header>
          <Card.Body>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Сотрудники</th>
                  <th>Посетители</th>
                  <th>Продажи</th>
                  <th>Конверсия %</th>
                  <th>Заказы</th>
                  <th>Диагностики</th>
                </tr>
              </thead>
              <tbody>
                {conversionData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.date}</td>
                    <td>{row.employees}</td>
                    <td>{row.visitors}</td>
                    <td>{row.sales}</td>
                    <td>{row.conversion}%</td>
                    <td>{row.orders}</td>
                    <td>{row.diagnostics}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Заказы */}
      {activeTab === 'orders' && (
        <Card>
          <Card.Header className="app-header">📦 Заказ позиций</Card.Header>
          <Card.Body>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>№</th>
                  <th>Наименование</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {ordersData.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.item}</td>
                    <td>
                      <span className={order.status === '✓' ? 'status-ok' : 'status-error'}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default Reports;
