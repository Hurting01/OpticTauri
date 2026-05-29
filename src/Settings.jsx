import { useState, useEffect, useRef } from 'react';
import { Card, Button, Form, Table, Nav, Modal } from 'react-bootstrap';
import NavigationHeader from './components/NavigationHeader';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('salary');
  const [settings, setSettings] = useState({
    salaryConsultant: 37500,
    salaryOptometrist: 40000,
    hoursNormConsultant: 180,
    hoursNormOptometrist: 150,
    hoursPerShiftConsultant: 12,
    hoursPerShiftOptometrist: 10,
    managerBonus: 5000
  });
  const [positions, setPositions] = useState([]);
  const [staff, setStaff] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addMode, setAddMode] = useState(null);
  const [newPositionName, setNewPositionName] = useState('');
  const [selectedPositionId, setSelectedPositionId] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

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
    
    const positionsList = await window.electronAPI.getPositions();
    setPositions(positionsList || []);
    
    const staffList = await window.electronAPI.getStaff();
    setStaff(staffList || []);
  };

  const handleSaveSettings = async () => {
    await window.electronAPI.saveSettings(settings);
  };

  const addPosition = () => {
    setAddMode('position');
    setNewPositionName('');
    setNewFullName('');
  };

  const addNewEmployee = () => {
    setAddMode('employee');
    setNewPositionName('');
    setSelectedPositionId(positions.length > 0 ? positions[0].id : '');
    setNewFullName('');
  };

  const handleSaveNewItem = async () => {
    if (addMode === 'position') {
      if (!newPositionName.trim()) return;
      
      setAddMode(null);
      setNewPositionName('');
      setShowAddModal(false);
      
      const created = await window.electronAPI.createPosition(newPositionName);
      if (created) {
        setPositions(prev => [...prev, created]);
      }
    } else if (addMode === 'employee') {
      if (!selectedPositionId || !newFullName.trim()) return;
      
      setAddMode(null);
      setSelectedPositionId('');
      setNewFullName('');
      setShowAddModal(false);
      
      const created = await window.electronAPI.createStaff(newFullName, selectedPositionId);
      if (created) {
        const position = positions.find(p => p.id === selectedPositionId);
        setStaff(prev => [...prev, { ...created, position_name: position?.name || '' }]);
      }
    }
  };

  const handleCancelAdd = () => {
    setAddMode(null);
    setNewPositionName('');
    setSelectedPositionId('');
    setNewFullName('');
  };

  const removePosition = async (pos) => {
    if (window.confirm('Удалить должность?')) {
      const success = await window.electronAPI.deletePosition(pos.id);
      if (success) {
        setPositions(prev => prev.filter(p => p.id !== pos.id));
      }
    }
  };

  const removeStaff = async (emp) => {
    if (window.confirm('Удалить сотрудника?')) {
      const success = await window.electronAPI.deleteStaff(emp.id);
      if (success) {
        setStaff(prev => prev.filter(s => s.id !== emp.id));
      }
    }
  };

  const getPositionName = (positionId) => {
    const pos = positions.find(p => p.id === positionId);
    return pos ? pos.name : '';
  };

  return (
    <div className="p-4 fade-in">
      <NavigationHeader title="Настройки" />

      <Nav variant="tabs" className="mb-3 reports-nav">
        <Nav.Item>
          <Nav.Link active={activeTab === 'salary'} onClick={() => setActiveTab('salary')}>
            Заработная плата
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={activeTab === 'hours'} onClick={() => setActiveTab('hours')}>
            Нормы часов
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={activeTab === 'staff'} onClick={() => setActiveTab('staff')}>
            Персонал и должности
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {activeTab === 'salary' && (
        <Card>
          <Card.Header className="app-header">Заработная плата</Card.Header>
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
      )}

      {activeTab === 'hours' && (
        <Card>
          <Card.Header className="app-header">Нормы часов</Card.Header>
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
      )}

      {activeTab === 'staff' && (
        <Card>
          <Card.Header className="app-header d-flex justify-content-between align-items-center">
            <span>👥 Персонал и должности</span>
            <div className="d-flex gap-2">
              <Button variant="outline-primary" size="sm" onClick={() => { setShowAddModal(true); addPosition(); }}>
                + Добавить должность
              </Button>
              <Button variant="outline-success" size="sm" onClick={() => { setShowAddModal(true); addNewEmployee(); }}>
                + Добавить сотрудника
              </Button>
            </div>
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
                {staff.map((emp) => (
                  <tr key={`staff-${emp.id}`}>
                    <td>{getPositionName(emp.position_id)}</td>
                    <td>{emp.full_name}</td>
                    <td>
                      <Button variant="outline-danger" size="sm" onClick={() => removeStaff(emp)}>
                        ✕
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <Modal show={showAddModal} onHide={() => { setShowAddModal(false); handleCancelAdd(); }} centered>
        <Modal.Header closeButton>
          <Modal.Title>{addMode === 'position' ? 'Добавить должность' : addMode === 'employee' ? 'Добавить сотрудника' : 'Добавить'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!addMode ? (
            <div className="d-flex flex-column gap-2">
              <Button variant="primary" size="lg" onClick={addPosition}>
                ➕ Добавить должность
              </Button>
              <Button variant="success" size="lg" onClick={addNewEmployee}>
                👤 Добавить сотрудника
              </Button>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              <Form.Group>
                <Form.Label>Должность</Form.Label>
                {addMode === 'employee' ? (
                  <Form.Select
                    value={selectedPositionId}
                    onChange={(e) => setSelectedPositionId(Number(e.target.value))}
                    autoFocus
                  >
                    <option value="">Выберите должность</option>
                    {positions.map((pos) => (
                      <option key={pos.id} value={pos.id}>
                        {pos.name}
                      </option>
                    ))}
                  </Form.Select>
                ) : (
                  <Form.Control
                    type="text"
                    value={newPositionName}
                    onChange={(e) => setNewPositionName(e.target.value)}
                    placeholder="Введите должность"
                    autoFocus
                  />
                )}
              </Form.Group>
              {addMode === 'employee' && (
                <Form.Group>
                  <Form.Label>ФИО</Form.Label>
                  <Form.Control
                    type="text"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    placeholder="Введите ФИО"
                  />
                </Form.Group>
              )}
              <div className="d-flex gap-2">
                <Button variant="primary" onClick={handleSaveNewItem}>
                  Сохранить
                </Button>
                <Button variant="secondary" onClick={handleCancelAdd}>
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Settings;