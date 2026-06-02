import { useState, useEffect } from 'react';
import { Card, Table, Nav, Form } from 'react-bootstrap';
import { invoke } from '@tauri-apps/api/core';
import NavigationHeader from './components/NavigationHeader';
import styles from './Reports.module.css';

const Reports = ({ month, year }) => {
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

  const getStored = (key) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  };

  const setStored = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const reportKey = (prefix) => `${prefix}:${year}-${month}`;

  // === Функции загрузки ===

  const loadSettings = async () => {
    const savedSettings = getStored('settings');
    if (savedSettings) {
      setSettings(savedSettings);
    }
  };

  const loadEmployees = async () => {
    const [staff, positions] = await Promise.all([
      invoke('get_staff'),
      invoke('get_positions')
    ]);
    const employeesList = staff.map((employee) => {
      const position = positions.find((item) => item.id === employee.position_id);
      return {
        ...employee,
        fullName: employee.full_name,
        isActive: employee.is_active !== 0,
        position: position?.name || '',
        position_name: position?.name || ''
      };
    });
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
      const savedData = getStored(reportKey('bonusReport'));
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
        setStored(reportKey('bonusReport'), { month, year, data });
      }
    } catch (error) {
      console.error('Error loading bonus data:', error);
    }
  };

  const loadSalaryData = async () => {
    try {
      const savedData = getStored(reportKey('salaryReport'));
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
        setStored(reportKey('salaryReport'), { month, year, data });
      }
    } catch (error) {
      console.error('Error loading salary data:', error);
    }
  };

  const loadConversionData = async () => {
    try {
      const savedData = getStored(reportKey('conversionReport'));
      if (savedData && savedData.data && savedData.data.length > 0) {
        setConversionData(savedData.data);
      } else {
        const data = [
          { date: '01.03.2026', employees: 'Письминская Ю./Машалова Т.', visitors: 17, sales: 3, conversion: 17.6, orders: 0, diagnostics: 1 },
          { date: '02.03.2026', employees: 'Каргина Е./Липенкова Т.', visitors: 12, sales: 2, conversion: 16.7, orders: 1, diagnostics: 0 }
        ];
        setConversionData(data);
        setStored(reportKey('conversionReport'), { month, year, data });
      }
    } catch (error) {
      console.error('Error loading conversion data:', error);
    }
  };

  const loadOrdersData = async () => {
    try {
      const savedData = getStored(reportKey('ordersReport'));
      if (savedData && savedData.data && savedData.data.length > 0) {
        setOrdersData(savedData.data);
      } else {
        const data = [
          { id: 1, item: 'Очки солнцезащитные', status: '✓' },
          { id: 2, item: 'Линзы контактные', status: '✗' },
          { id: 3, item: 'Оправа пластиковая', status: '✓' }
        ];
        setOrdersData(data);
        setStored(reportKey('ordersReport'), { month, year, data });
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
        setStored(reportKey('bonusReport'), { month, year, data: bonusData });
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
        setStored(reportKey('conversionReport'), { month, year, data: conversionData });
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
        setStored(reportKey('ordersReport'), { month, year, data: ordersData });
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
    <div className={styles.container}>
      <NavigationHeader title="Отчеты" />

      {/* Навигация по отчетам */}
      <Nav variant="tabs" className={styles.reportsNav}>
        <Nav.Item>
          <Nav.Link active={activeTab === 'bonus'} onClick={() => setActiveTab('bonus')}>
            Бонусы
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={activeTab === 'salary'} onClick={() => setActiveTab('salary')}>
            ЗП
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={activeTab === 'conversion'} onClick={() => setActiveTab('conversion')}>
            Конверсия
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={activeTab === 'orders'} onClick={() => setActiveTab('orders')}>
            Заказы
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Бонусы */}
      {activeTab === 'bonus' && (
        <Card className={styles.card}>
          <Card.Header className={`${styles.cardHeader} ${styles.cardHeaderRow}`}>
            <span>📋 Итоги бонусов по продажам за {monthNames[month - 1]} {year}</span>
            {saveStatus === 'bonus' && (
              <span className={styles.saveStatus}>✓ Сохранено</span>
            )}
          </Card.Header>
          <Card.Body>
            {(!employees || employees.filter(emp => emp.fullName).length === 0) ? (
              <div className={styles.emptyState}>
                <p className="mb-0">Сотрудники не указаны</p>
                <small>Добавьте сотрудников в настройках</small>
              </div>
            ) : (
              <Table striped bordered hover className={styles.bonusTable}>
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
                            className={styles.bonusInput}
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
        <Card className={styles.card}>
          <Card.Header className={styles.cardHeader}>Заработная плата за {monthNames[month - 1]} {year}</Card.Header>
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
        <Card className={styles.card}>
          <Card.Header className={styles.cardHeader}>Конверсия продаж</Card.Header>
          <Card.Body>
            <Table striped bordered hover size="sm" className={styles.table}>
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
        <Card className={styles.card}>
          <Card.Header className={styles.cardHeader}>Заказ позиций</Card.Header>
          <Card.Body>
            <Table striped bordered hover className={styles.table}>
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
                      <span className={order.status === '✓' ? styles.statusOk : styles.statusError}>
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
