import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Table } from 'react-bootstrap';
import EmployeesService from './employeesService';

const Settings = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    salaryConsultant: 37500,
    salaryOptometrist: 40000,
    hoursNormConsultant: 180,
    hoursNormOptometrist: 150,
    hoursPerShiftConsultant: 12,
    hoursPerShiftOptometrist: 10,
    managerBonus: 5000
  });
  const [employees, setEmployees] = useState([]);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  // Автосохранение настроек
  useEffect(() => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      handleSaveSettings();
    }, 1000);
    return () => clearTimeout(saveTimeoutRef.current);
  }, [settings]);

  const loadData = async () => {
    const savedSettings = await window.electronAPI.getSettings();
    if (savedSettings) {
      const { employees: _, ...cleanSettings } = savedSettings;
      setSettings(cleanSettings);
    }
    const employeesList = await EmployeesService.getEmployees();
    setEmployees(employeesList);
  };

  const handleSaveSettings = async () => {
    await window.electronAPI.saveSettings(settings);
  };

  // --- Сотрудники ---

  const handleEmployeeChange = (id, field, value) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { ...emp, [field]: value } : emp
    ));
  };

  const handleEmployeeBlur = async (emp) => {
    if (emp.id) {
      // Обновление существующего
      await EmployeesService.updateEmployee(emp.id, {
        position: emp.position,
        fullName: emp.fullName
      });
    } else if (emp.position || emp.fullName) {
      // Создание нового
      const created = await EmployeesService.createEmployee({
        position: emp.position,
        fullName: emp.fullName,
        isActive: true,
        sortOrder: employees.length
      });
      if (created) {
        setEmployees(prev => prev.map(e => (e.id === null ? created : e)));
      }
    } else {
      // Пустой — удаляем строку
      setEmployees(prev => prev.filter(e => e !== emp));
    }
  };

  const addEmployee = () => {
    setEmployees([...employees, { id: null, position: '', fullName: '' }]);
  };

  const removeEmployee = async (emp) => {
    if (emp.id) {
      if (window.confirm('Удалить этого сотрудника?')) {
        const success = await EmployeesService.deleteEmployee(emp.id);
        if (success) {
          setEmployees(prev => prev.filter(e => e.id !== emp.id));
        }
      }
    } else {
      // Временный (не сохраненный)
      setEmployees(prev => prev.filter(e => e !== emp));
    }
  };

  return (
    <div className="p-4 fade-in">
      {/* Заголовок */}
      <Card className="mb-3 top-panel">
        <Card.Body className="py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0 month-title">⚙️ Настройки</h1>

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

      <div className="row">
        {/* ЗП и нормы часов */}
        <div className="col-md-6">
          <Card className="mb-3">
            <Card.Header>💰 Заработная плата</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>ЗП Продавцы-консультанты (₽)</Form.Label>
                <Form.Control
                  type="number"
                  value={settings.salaryConsultant}
                  onChange={(e) => setSettings({ ...settings, salaryConsultant: Number(e.target.value) })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>ЗП Оптометристы (₽)</Form.Label>
                <Form.Control
                  type="number"
                  value={settings.salaryOptometrist}
                  onChange={(e) => setSettings({ ...settings, salaryOptometrist: Number(e.target.value) })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Доплата управляющего (₽)</Form.Label>
                <Form.Control
                  type="number"
                  value={settings.managerBonus}
                  onChange={(e) => setSettings({ ...settings, managerBonus: Number(e.target.value) })}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header>🕐 Нормы часов</Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Норма часов у оптик-консультантов</Form.Label>
                <Form.Control
                  type="number"
                  value={settings.hoursNormConsultant}
                  onChange={(e) => setSettings({ ...settings, hoursNormConsultant: Number(e.target.value) })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Норма часов у оптометристов</Form.Label>
                <Form.Control
                  type="number"
                  value={settings.hoursNormOptometrist}
                  onChange={(e) => setSettings({ ...settings, hoursNormOptometrist: Number(e.target.value) })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Часов/смена у продавцов-консультантов</Form.Label>
                <Form.Control
                  type="number"
                  value={settings.hoursPerShiftConsultant}
                  onChange={(e) => setSettings({ ...settings, hoursPerShiftConsultant: Number(e.target.value) })}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Часов/смена у оптометристов</Form.Label>
                <Form.Control
                  type="number"
                  value={settings.hoursPerShiftOptometrist}
                  onChange={(e) => setSettings({ ...settings, hoursPerShiftOptometrist: Number(e.target.value) })}
                />
              </Form.Group>
            </Card.Body>
          </Card>
        </div>

        {/* Сотрудники */}
        <div className="col-md-6">
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <span>👥 Персонал и должности</span>
              <Button variant="outline-primary" size="sm" onClick={addEmployee}>
                + Добавить
              </Button>
            </Card.Header>
            <Card.Body>
              <Table striped bordered hover size="sm" className="employees-table">
                <thead>
                  <tr>
                    <th>Должность</th>
                    <th>ФИО</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id ?? `temp-${Math.random()}`}>
                      <td>
                        <Form.Control
                          type="text"
                          size="sm"
                          value={emp.position}
                          onChange={(e) => handleEmployeeChange(emp.id, 'position', e.target.value)}
                          onBlur={() => handleEmployeeBlur(emp)}
                          placeholder="Должность"
                        />
                      </td>
                      <td>
                        <Form.Control
                          type="text"
                          size="sm"
                          value={emp.fullName}
                          onChange={(e) => handleEmployeeChange(emp.id, 'fullName', e.target.value)}
                          onBlur={() => handleEmployeeBlur(emp)}
                          placeholder="ФИО"
                        />
                      </td>
                      <td>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeEmployee(emp)}
                        >
                          ✕
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
