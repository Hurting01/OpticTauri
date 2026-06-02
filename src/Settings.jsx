import { useState, useEffect } from 'react';
import { Card, Button, Form, Table, Nav, Modal } from 'react-bootstrap';
import { invoke } from '@tauri-apps/api/core';
import NavigationHeader from './components/NavigationHeader';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('positions');
  const [positions, setPositions] = useState([]);
  const [staff, setStaff] = useState([]);
  const [modalMode, setModalMode] = useState(null); // null | 'position' | 'employee'
  const [newPositionName, setNewPositionName] = useState('');
  const [newPositionData, setNewPositionData] = useState({
    norm_hours: null,
    hours_per_shift: null,
    salary: null,
    additional_payments: null,
  });
  const [selectedPositionId, setSelectedPositionId] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [editingPosition, setEditingPosition] = useState(null);
  const [editingStaff, setEditingStaff] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const positionsList = await invoke('get_positions');
      setPositions(positionsList || []);
    } catch (err) {
      console.error('Ошибка загрузки должностей:', err);
    }

    try {
      const staffList = await invoke('get_staff');
      setStaff(staffList || []);
    } catch (err) {
      console.error('Ошибка загрузки персонала:', err);
    }
  };

  const handleSavePosition = async (pos) => {
    try {
      await invoke('update_position', {
        positionId: pos.id,
        positionName: pos.name,
        normHours: pos.norm_hours,
        hoursPerShift: pos.hours_per_shift,
        salary: pos.salary,
        additionalPayments: pos.additional_payments,
      });
      const updated = positions.find(p => p.id === pos.id);
      if (updated) {
        Object.assign(updated, pos);
        setPositions([...positions]);
      }
    } catch (err) {
      console.error('Ошибка сохранения:', err);
      alert('Ошибка сохранения: ' + err);
    }
  };

  const openAddPosition = () => {
    setModalMode('position');
    setNewPositionName('');
    setNewPositionData({
      norm_hours: null,
      hours_per_shift: null,
      salary: null,
      additional_payments: null,
    });
  };

  const openAddEmployee = () => {
    setModalMode('employee');
    setNewPositionName('');
    setSelectedPositionId(positions.length > 0 ? positions[0].id : '');
    setNewFullName('');
  };

  const handleSaveNewItem = async () => {
    if (modalMode === 'position') {
      if (!newPositionName.trim()) return;

      try {
        const created = await invoke('create_position', {
          name: newPositionName,
          normHours: newPositionData.norm_hours,
          hoursPerShift: newPositionData.hours_per_shift,
          salary: newPositionData.salary,
          additionalPayments: newPositionData.additional_payments,
        });
        if (created) {
          setPositions(prev => [...prev, created]);
        }
      } catch (err) {
        console.error('Ошибка создания должности:', err);
        alert('Ошибка создания должности: ' + err);
      }
    } else if (modalMode === 'employee') {
      if (!selectedPositionId || !newFullName.trim()) return;

      try {
        const created = await invoke('create_staff', {
          fullName: newFullName,
          positionId: Number(selectedPositionId)
        });
        if (created) {
          const position = positions.find(p => p.id === selectedPositionId);
          setStaff(prev => [...prev, { ...created, position_name: position?.name || '' }]);
        }
      } catch (err) {
        console.error('Ошибка создания сотрудника:', err);
        alert('Ошибка создания сотрудника: ' + err);
      }
    }

    setModalMode(null);
  };

  const closeModal = () => {
    setModalMode(null);
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
      const updated = await invoke('update_position', {
        positionId: editingPosition.id,
        positionName: newPositionName,
        normHours: editingPosition.norm_hours,
        hoursPerShift: editingPosition.hours_per_shift,
        salary: editingPosition.salary,
        additionalPayments: editingPosition.additional_payments,
      });
      setPositions(prev => prev.map(p => p.id === editingPosition.id ? updated : p));
      setEditingPosition(null);
      setNewPositionName('');
    } catch (err) {
      console.error('Ошибка обновления должности:', err);
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
      const updated = await invoke('update_staff', {
        staffId: editingStaff.id,
        newFullName,
        newPositionId: Number(selectedPositionId),
      });
      const position = positions.find(p => p.id === Number(selectedPositionId));
      setStaff(prev => prev.map(s => s.id === editingStaff.id ? { ...updated, position_name: position?.name || '' } : s));
      setEditingStaff(null);
      setSelectedPositionId('');
      setNewFullName('');
    } catch (err) {
      console.error('Ошибка обновления сотрудника:', err);
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

  const getPositionById = (positionId) => {
    return positions.find(p => p.id === positionId) || null;
  };

  const formatSalary = (val) => {
    return val != null ? Number(val).toLocaleString('ru-RU') : '—';
  };

  const isManager = (pos) => {
    return pos && pos.name.toLowerCase().includes('управляющ');
  };

  return (
    <div className="p-4 fade-in">
      <NavigationHeader title="Настройки" />

      <Nav variant="tabs" className="mb-3 reports-nav">
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

      {/* === ДОЛЖНОСТИ === */}
      {activeTab === 'positions' && (
        <Card>
          <Card.Header className="app-header d-flex justify-content-between align-items-center">
            <span>Таблица должностей</span>
            <Button variant="outline-primary" size="sm" onClick={openAddPosition}>
              + Добавить должность
            </Button>
          </Card.Header>
          <Card.Body>
            {editingPosition ? (
              <div className="d-flex flex-column gap-2">
                <Form.Control
                  type="text"
                  value={newPositionName}
                  onChange={(e) => setNewPositionName(e.target.value)}
                  placeholder="Название должности"
                  style={{ maxWidth: '300px' }}
                  autoFocus
                />
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="Норма часов"
                  value={editingPosition.norm_hours ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : Math.max(0, Number(e.target.value));
                    setEditingPosition(prev => ({ ...prev, norm_hours: val }));
                  }}
                />
                <Form.Control
                  type="number"
                  step="0.5"
                  min="0"
                  placeholder="Часов/смена"
                  value={editingPosition.hours_per_shift ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : Math.max(0, Number(e.target.value));
                    setEditingPosition(prev => ({ ...prev, hours_per_shift: val }));
                  }}
                />
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="Зарплата (₽)"
                  value={editingPosition.salary ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : Math.max(0, Number(e.target.value));
                    setEditingPosition(prev => ({ ...prev, salary: val }));
                  }}
                />
                <Form.Control
                  type="number"
                  min="0"
                  placeholder="Дополнительные выплаты (₽)"
                  value={editingPosition.additional_payments ?? ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : Math.max(0, Number(e.target.value));
                    setEditingPosition(prev => ({ ...prev, additional_payments: val }));
                  }}
                />
                <div className="d-flex gap-2">
                  <Button variant="success" size="sm" onClick={saveEditPosition}>
                    Сохранить
                  </Button>
                  <Button variant="secondary" size="sm" onClick={cancelEditPosition}>
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <Table striped bordered hover size="sm" className="employees-table">
                <thead>
                  <tr>
                    <th>Должность</th>
                    <th>Норма ч.</th>
                    <th>Часов/смена</th>
                    <th>Зарплата (₽)</th>
                    <th>Доп. выплаты (₽)</th>
                    <th style={{ width: '120px' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center text-muted">Нет должностей</td>
                    </tr>
                  ) : (
                    positions.map((pos) => {
                      const mgr = isManager(pos);
                      const salary = (pos.salary || 0) + (mgr ? (pos.additional_payments || 0) : 0);

                      return (
                        <tr key={`pos-${pos.id}`}>
                          <td><strong>{pos.name}</strong></td>
                          <td>{pos.norm_hours ?? '—'}</td>
                          <td>{pos.hours_per_shift ?? '—'}</td>
                          <td>{salary > 0 ? formatSalary(salary) : '—'}</td>
                          <td>{pos.additional_payments != null && pos.additional_payments > 0 ? formatSalary(pos.additional_payments) : '—'}</td>
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
                      );
                    })
                  )}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      )}

      {/* === ПЕРСОНАЛ === */}
      {activeTab === 'staff' && (
        <Card>
          <Card.Header className="app-header d-flex justify-content-between align-items-center">
            <span>Персонал</span>
            <Button variant="outline-success" size="sm" onClick={openAddEmployee}>
              + Добавить сотрудника
            </Button>
          </Card.Header>
          <Card.Body>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>Должность</th>
                  <th>ФИО</th>
                  <th style={{ width: '120px' }}>Действия</th>
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

      {/* Единственное модальное окно */}
      <Modal key={modalMode} show={modalMode !== null} onHide={closeModal} backdrop="static" keyboard={false} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'position' ? 'Добавить должность' : 'Добавить сотрудника'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column gap-3">
            <Form.Group>
              <Form.Label>{modalMode === 'employee' ? 'Должность' : 'Название должности'}</Form.Label>
              {modalMode === 'employee' ? (
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
            {modalMode === 'position' && (
              <>
                <Form.Group>
                  <Form.Label>Норма часов</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={newPositionData.norm_hours ?? ''}
                    onChange={(e) => setNewPositionData(prev => ({ ...prev, norm_hours: e.target.value === '' ? null : Math.max(0, Number(e.target.value)) }))}
                    placeholder="Введите значение"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Часов/смена</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.5"
                    min="0"
                    value={newPositionData.hours_per_shift ?? ''}
                    onChange={(e) => setNewPositionData(prev => ({ ...prev, hours_per_shift: e.target.value === '' ? null : Math.max(0, Number(e.target.value)) }))}
                    placeholder="Введите значение"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Зарплата (₽)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={newPositionData.salary ?? ''}
                    onChange={(e) => setNewPositionData(prev => ({ ...prev, salary: e.target.value === '' ? null : Math.max(0, Number(e.target.value)) }))}
                    placeholder="Введите значение"
                  />
                </Form.Group>
                <Form.Group>
                  <Form.Label>Дополнительные выплаты (₽)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={newPositionData.additional_payments ?? ''}
                    onChange={(e) => setNewPositionData(prev => ({ ...prev, additional_payments: e.target.value === '' ? null : Math.max(0, Number(e.target.value)) }))}
                    placeholder="Введите значение"
                  />
                </Form.Group>
              </>
            )}
            {modalMode === 'employee' && (
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
              <Button variant="secondary" onClick={closeModal}>
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