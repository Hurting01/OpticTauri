import { useState, useEffect, useRef } from 'react';
import { Card, Button, Form, Table, Nav, Modal } from 'react-bootstrap';
import { invoke } from '@tauri-apps/api/core';
import NavigationHeader from './components/NavigationHeader';
import styles from './Settings.module.css';

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
  const [editingPosition, setEditingPosition] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);
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
    const value = localStorage.getItem('settings');
    const savedSettings = value ? JSON.parse(value) : null;
    if (savedSettings) {
      const { employees: _, ...cleanSettings } = savedSettings;
      setSettings(cleanSettings);
    }
    
    const positionsList = await invoke('get_positions');
    setPositions(positionsList || []);
    
    const staffList = await invoke('get_staff');
    setStaff(staffList || []);
  };

  const handleSaveSettings = async () => {
    localStorage.setItem('settings', JSON.stringify(settings));
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
      
      try {
        const created = await invoke('create_position', { name: newPositionName });
        if (created) {
          setPositions(prev => [...prev, created]);
        }
      } catch (err) {
        console.error('Failed to create position:', err);
        alert('Ошибка сохранения должности: ' + err);
      }
    } else if (addMode === 'employee') {
      if (!selectedPositionId || !newFullName.trim()) return;
      
      setAddMode(null);
      setSelectedPositionId('');
      setNewFullName('');
      setShowAddModal(false);
      
      const created = await invoke('create_staff', { fullName: newFullName, positionId: Number(selectedPositionId) });
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
      const success = await invoke('delete_position', { positionId: pos.id });
      if (success) {
        setPositions(prev => prev.filter(p => p.id !== pos.id));
      }
    }
  };

  const removeStaff = async (emp) => {
    if (window.confirm('Удалить сотрудника?')) {
      const success = await invoke('delete_staff', { staffId: emp.id });
      if (success) {
        setStaff(prev => prev.filter(s => s.id !== emp.id));
      }
    }
  };

  const handleEditPosition = (pos) => {
    setEditingPosition(pos);
    setNewPositionName(pos.name);
  };

  const handleEditStaff = (emp) => {
    setEditingStaff(emp);
    setSelectedPositionId(emp.position_id);
    setNewFullName(emp.full_name);
  };

  const saveEditPosition = async () => {
    if (!editingPosition || !newPositionName.trim()) return;
    
    try {
      const updated = await invoke('update_position', { positionId: editingPosition.id, positionName: newPositionName });
      setPositions(prev => prev.map(p => p.id === editingPosition.id ? updated : p));
      setEditingPosition(null);
      setNewPositionName('');
    } catch (err) {
      console.error('Failed to update position:', err);
      alert('Ошибка обновления должности: ' + err);
    }
  };

  const cancelEditPosition = () => {
    setEditingPosition(null);
    setNewPositionName('');
  };

  const saveEditStaff = async () => {
    if (!editingStaff || !selectedPositionId || !newFullName.trim()) return;
    
    try {
      const updated = await invoke('update_staff', { staffId: editingStaff.id, newFullName, newPositionId: Number(selectedPositionId) });
      const position = positions.find(p => p.id === Number(selectedPositionId));
      setStaff(prev => prev.map(s => s.id === editingStaff.id ? { ...updated, position_name: position?.name || '' } : s));
      setEditingStaff(null);
      setSelectedPositionId('');
      setNewFullName('');
    } catch (err) {
      console.error('Failed to update staff:', err);
      alert('Ошибка обновления сотрудника: ' + err);
    }
  };

  const cancelEditStaff = () => {
    setEditingStaff(null);
    setSelectedPositionId('');
    setNewFullName('');
  };

  const getPositionName = (positionId) => {
    const pos = positions.find(p => p.id === positionId);
    return pos ? pos.name : '';
  };

  return (
    <div className={styles.container}>
      <NavigationHeader title="Настройки" />

      <Nav variant="tabs" className={`mb-3 ${styles.settingsNav}`}>
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
          <Nav.Link active={activeTab === 'positions'} onClick={() => setActiveTab('positions')}>
            Должности
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link active={activeTab === 'staff'} onClick={() => setActiveTab('staff')}>
            Персонал
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

      {activeTab === 'positions' && (
        <Card>
          <Card.Header className="app-header d-flex justify-content-between align-items-center">
            <span>Список должностей</span>
            <Button variant="outline-primary" size="sm" onClick={() => { setShowAddModal(true); addPosition(); }}>
              + Добавить должность
            </Button>
          </Card.Header>
          <Card.Body>
            {editingPosition ? (
              <div className="d-flex gap-2 align-items-center">
                <Form.Control
                  type="text"
                  value={newPositionName}
                  onChange={(e) => setNewPositionName(e.target.value)}
                  placeholder="Название должности"
                  style={{ maxWidth: '300px' }}
                  autoFocus
                />
                <Button variant="success" size="sm" onClick={saveEditPosition}>
                  Сохранить
                </Button>
                <Button variant="secondary" size="sm" onClick={cancelEditPosition}>
                  Отмена
                </Button>
              </div>
            ) : (
              <Table striped bordered hover size="sm" className="employees-table">
                <thead>
                  <tr>
                    <th>Название</th>
                    <th style={{ width: '150px' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="text-center text-muted">Нет должностей</td>
                    </tr>
                  ) : (
                    positions.map((pos) => (
                      <tr key={`pos-${pos.id}`}>
                        <td>{pos.name}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button variant="outline-primary" size="sm" onClick={() => handleEditPosition(pos)}>
                              ✎
                            </Button>
                            <Button variant="outline-danger" size="sm" onClick={() => removePosition(pos)}>
                              ✕
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

      {activeTab === 'staff' && (
        <Card>
          <Card.Header className="app-header d-flex justify-content-between align-items-center">
            <span>Персонал</span>
            <Button variant="outline-success" size="sm" onClick={() => { setShowAddModal(true); addNewEmployee(); }}>
              + Добавить сотрудника
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
                {editingStaff ? (
                  <tr>
                    <td>
                      <Form.Select
                        value={selectedPositionId}
                        onChange={(e) => setSelectedPositionId(Number(e.target.value))}
                        style={{ maxWidth: '200px' }}
                        size="sm"
                      >
                        {positions.map((pos) => (
                          <option key={pos.id} value={pos.id}>
                            {pos.name}
                          </option>
                        ))}
                      </Form.Select>
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        value={newFullName}
                        onChange={(e) => setNewFullName(e.target.value)}
                        placeholder="ФИО"
                        style={{ maxWidth: '250px' }}
                        size="sm"
                      />
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button variant="success" size="sm" onClick={saveEditStaff}>
                          Сохранить
                        </Button>
                        <Button variant="secondary" size="sm" onClick={cancelEditStaff}>
                          Отмена
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : staff.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center text-muted">Нет сотрудников</td>
                  </tr>
                ) : (
                  staff.map((emp) => (
                    <tr key={`staff-${emp.id}`}>
                      <td>{getPositionName(emp.position_id)}</td>
                      <td>{emp.full_name}</td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button variant="outline-primary" size="sm" onClick={() => handleEditStaff(emp)}>
                            ✎
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => removeStaff(emp)}>
                            ✕
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
            <div className="d-flex flex-column gap-3">
              <Form.Group>
                <Form.Label>{addMode === 'employee' ? 'Должность' : 'Название должности'}</Form.Label>
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
          </Modal.Body>
      </Modal>
    </div>
  );
};

export default Settings;
