import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Form, Table, Row, Col, Modal } from 'react-bootstrap';
import { invoke } from '@tauri-apps/api/core';
import NavigationHeader from './components/NavigationHeader';
import styles from './DaySheet.module.css';

const DaySheet = ({ month, year }) => {
  const { day } = useParams();
  const navigate = useNavigate();
  const dayNum = parseInt(day);

  const [allEmployees, setAllEmployees] = useState([]);
  const [dayEmployees, setDayEmployees] = useState([
    { id: null, position: '', fullName: '' },
    { id: null, position: '', fullName: '' }
  ]);
  const [cashMorning, setCashMorning] = useState('');
  const [cashEvening, setCashEvening] = useState('');
  const [sales, setSales] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [openAccordion, setOpenAccordion] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saleToDelete, setSaleToDelete] = useState(null);
  const [openTaskId, setOpenTaskId] = useState(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [taskPage, setTaskPage] = useState(0);
  const tasksPerPage = 4;
  const [salePage, setSalePage] = useState(0);
  const salesPerPage = 10;
  const saveTimeoutRef = useRef(null);
  const isSavingRef = useRef(false);

  const dataRef = useRef({
    sales: [],
    employees: [],
    cashMorning: '',
    cashEvening: '',
    tasks: []
  });

  const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  
  const calendarDays = [];
  
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ type: 'empty', key: `empty-${i}` });
  }
  
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month - 1, d);
    calendarDays.push({
      type: 'day',
      day: d,
      weekDay: weekDays[date.getDay()],
      isToday: d === new Date().getDate() && month === new Date().getMonth() + 1,
      key: `day-${d}`
    });
  }

  const monthNamesGenitive = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  const generateSphValues = () => {
    const values = ['0'];
    for (let v = -0.25; v >= -20.00; v -= 0.25) {
      values.push(v.toFixed(2));
    }
    for (let v = 0.25; v <= 20.00; v += 0.25) {
      values.push('+' + v.toFixed(2));
    }
    return values;
  };

  const generateCylValues = () => {
    const values = ['0'];
    for (let v = -0.25; v >= -10.00; v -= 0.25) {
      values.push(v.toFixed(2));
    }
    for (let v = 0.25; v <= 10.00; v += 0.25) {
      values.push('+' + v.toFixed(2));
    }
    return values;
  };

  const generateAxValues = () => {
    const values = [];
    for (let v = 0; v < 180; v += 5) {
      values.push(v.toString());
    }
    return values;
  };

  const sphValues = generateSphValues();
  const cylValues = generateCylValues();
  const axValues = generateAxValues();

  const totalPages = Math.ceil(tasks.length / tasksPerPage);
  const currentTasks = tasks.slice(taskPage * tasksPerPage, (taskPage + 1) * tasksPerPage);
  const totalSalesPages = Math.ceil(sales.length / salesPerPage);
  const currentSales = sales.slice(salePage * salesPerPage, (salePage + 1) * salesPerPage);

  const getDayData = () => {
    const value = localStorage.getItem(`day:${year}-${month}-${dayNum}`);
    return value ? JSON.parse(value) : null;
  };

  const saveDayData = (data) => {
    localStorage.setItem(`day:${year}-${month}-${dayNum}`, JSON.stringify(data));
  };

  // Загрузка данных
  useEffect(() => {
    loadData();
    loadEmployees();
  }, [day, month, year]);

  const loadData = async () => {
    const data = getDayData();
    if (data) {
      setDayEmployees(data.employees || [{ id: null, position: '', fullName: '' }, { id: null, position: '', fullName: '' }]);
      setCashMorning(data.cashMorning || '');
      setCashEvening(data.cashEvening || '');
      setSales(data.sales || []);
      setTasks(data.tasks || []);
    }
  };

  const loadEmployees = async () => {
    const [staff, positions] = await Promise.all([
      invoke('get_staff'),
      invoke('get_positions')
    ]);
    const employees = staff.map((employee) => {
      const position = positions.find((item) => item.id === employee.position_id);
      return {
        ...employee,
        fullName: employee.full_name,
        isActive: employee.is_active !== 0,
        position: position?.name || '',
        position_name: position?.name || ''
      };
    });
    setAllEmployees(employees);
  };

  // Автосохранение
  useEffect(() => {
    dataRef.current = { sales, dayEmployees, cashMorning, cashEvening, tasks };
    
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    
    saveTimeoutRef.current = setTimeout(() => {
      if (!isSavingRef.current) {
        isSavingRef.current = true;
        Promise.resolve(saveDayData({
          employees: dayEmployees,
          cashMorning,
          cashEvening,
          sales,
          tasks
        })).then(() => {
          isSavingRef.current = false;
        });
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [sales, dayEmployees, cashMorning, cashEvening, tasks, dayNum, month, year]);

  // Обработчики
  const addSale = () => {
    const newSale = {
      id: Date.now(),
      name: '',
      price: '',
      sph: '',
      cyl: '',
      ax: '',
      add: '',
      pd: '',
      material: '',
      coating: ''
    };
    setSales([...sales, newSale]);
  };

  const updateSale = (id, field, value) => {
    setSales(sales.map(sale => 
      sale.id === id ? { ...sale, [field]: value } : sale
    ));
  };

  const deleteSale = (id) => {
    setSales(sales.filter(sale => sale.id !== id));
    setShowDeleteConfirm(false);
  };

  const confirmDelete = () => {
    if (saleToDelete) {
      deleteSale(saleToDelete);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setSaleToDelete(null);
  };

  const showDeleteModal = (id) => {
    setSaleToDelete(id);
    setShowDeleteConfirm(true);
  };

  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask = {
        id: Date.now(),
        text: newTaskText,
        completed: false,
        notes: ''
      };
      setTasks([...tasks, newTask]);
      setNewTaskText('');
    }
  };

  const handleTaskKeyPress = (e) => {
    if (e.key === 'Enter') {
      addTask();
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const removeTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const updateTaskNotes = (id, notes) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, notes } : task
    ));
  };

  const nextPage = () => {
    if (taskPage < totalPages - 1) setTaskPage(taskPage + 1);
  };

  const prevPage = () => {
    if (taskPage > 0) setTaskPage(taskPage - 1);
  };

  const nextSalePage = () => {
    if (salePage < totalSalesPages - 1) setSalePage(salePage + 1);
  };

  const prevSalePage = () => {
    if (salePage > 0) setSalePage(salePage - 1);
  };

  const handleEmployeeChange = (index, field, value) => {
    const newEmployees = [...dayEmployees];
    newEmployees[index] = { ...newEmployees[index], [field]: value };
    setDayEmployees(newEmployees);
  };

  const addEmployeeRow = () => {
    setDayEmployees([...dayEmployees, { id: null, position: '', fullName: '' }]);
  };

  const removeEmployeeRow = (index) => {
    setDayEmployees(dayEmployees.filter((_, i) => i !== index));
  };

  const totalCash = (parseFloat(cashMorning) || 0) + (parseFloat(cashEvening) || 0);
  const totalCashless = sales.reduce((sum, sale) => sum + (parseFloat(sale.price) || 0), 0);
  const totalCard = totalCash + totalCashless;

  return (
    <div className={styles.container}>
      <NavigationHeader
        title={`${dayNum} ${monthNamesGenitive[month - 1]} ${year}`}
        showBackButton={true}
        backUrl="/"
      />

      <div className="d-flex gap-4">
        {/* Основной контент */}
        <div className={styles.mainSection}>
          {/* Сотрудники */}
          <div className={styles.employeesSection}>
            <h4>Сотрудники</h4>
            {dayEmployees.map((emp, idx) => (
              <div key={idx} className="employee-row">
                <Form.Control
                  type="text"
                  placeholder="Должность"
                  value={emp.position}
                  onChange={(e) => handleEmployeeChange(idx, 'position', e.target.value)}
                  list="positions-list"
                />
                <Form.Control
                  type="text"
                  placeholder="ФИО"
                  value={emp.fullName}
                  onChange={(e) => handleEmployeeChange(idx, 'fullName', e.target.value)}
                  list="employees-list"
                />
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => removeEmployeeRow(idx)}
                >
                  ✕
                </Button>
              </div>
            ))}
            <Button variant="outline-primary" size="sm" onClick={addEmployeeRow} className="mt-2">
              + Добавить сотрудника
            </Button>
            <datalist id="positions-list">
              {[...new Set(allEmployees.map(e => e.position))].map(pos => (
                <option key={pos} value={pos} />
              ))}
            </datalist>
            <datalist id="employees-list">
              {allEmployees.map(emp => (
                <option key={emp.id} value={emp.fullName} />
              ))}
            </datalist>
          </div>

          {/* Продажи */}
          <div className={styles.salesSection}>
            <h4>🛍️ Продажи</h4>
            <div className={styles.salesList}>
              {currentSales.map((sale) => (
                <div key={sale.id} className={`${styles.saleItem} ${openAccordion === sale.id ? styles.open : ''}`}>
                  <div className={styles.saleHeader} onClick={() => setOpenAccordion(openAccordion === sale.id ? null : sale.id)}>
                    <span className={styles.saleHeaderTitle}>{sale.name || 'Новая продажа'}</span>
                    <span className={styles.saleHeaderPrice}>{sale.price ? parseFloat(sale.price).toLocaleString('ru-RU') + ' ₽' : '0 ₽'}</span>
                  </div>
                  <div className={styles.saleBody}>
                    <Row className="mb-2">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Наименование</Form.Label>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={sale.name}
                            onChange={(e) => updateSale(sale.id, 'name', e.target.value)}
                            className={styles.compactInput}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Цена (₽)</Form.Label>
                          <Form.Control
                            type="number"
                            size="sm"
                            value={sale.price}
                            onChange={(e) => updateSale(sale.id, 'price', e.target.value)}
                            className={styles.compactInput}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mb-2">
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>SPH</Form.Label>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={sale.sph}
                            onChange={(e) => updateSale(sale.id, 'sph', e.target.value)}
                            list="sph-options"
                            className={styles.compactInput}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>CYL</Form.Label>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={sale.cyl}
                            onChange={(e) => updateSale(sale.id, 'cyl', e.target.value)}
                            list="cyl-options"
                            className={styles.compactInput}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>AX</Form.Label>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={sale.ax}
                            onChange={(e) => updateSale(sale.id, 'ax', e.target.value)}
                            list="ax-options"
                            className={styles.compactInput}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={3}>
                        <Form.Group>
                          <Form.Label>ADD</Form.Label>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={sale.add}
                            onChange={(e) => updateSale(sale.id, 'add', e.target.value)}
                            className={styles.compactInput}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row className="mb-2">
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>PD</Form.Label>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={sale.pd}
                            onChange={(e) => updateSale(sale.id, 'pd', e.target.value)}
                            className={styles.compactInput}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Материал</Form.Label>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={sale.material}
                            onChange={(e) => updateSale(sale.id, 'material', e.target.value)}
                            className={styles.compactInput}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Покрытие</Form.Label>
                          <Form.Control
                            type="text"
                            size="sm"
                            value={sale.coating}
                            onChange={(e) => updateSale(sale.id, 'coating', e.target.value)}
                            className={styles.compactInput}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => showDeleteModal(sale.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="primary" size="sm" onClick={addSale} className="mt-2">
              + Добавить продажу
            </Button>
            {totalSalesPages > 1 && (
              <div className={styles.salePagination}>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={salePage === 0}
                  onClick={prevSalePage}
                  className={styles.salePageBtn}
                >
                  ←
                </Button>
                <span className={styles.salePageInfo}>{salePage + 1} / {totalSalesPages}</span>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={salePage === totalSalesPages - 1}
                  onClick={nextSalePage}
                  className={styles.salePageBtn}
                >
                  →
                </Button>
              </div>
            )}
          </div>

          {/* Итоги */}
          <Row className={styles.summaryRow}>
            <Col md={4}>
              <div className={styles.dayHeaderCard}>
                <h3>Наличные</h3>
                <div className={`${styles.dayHeaderValue} ${styles.cash}`}>{totalCash.toLocaleString('ru-RU')} ₽</div>
              </div>
            </Col>
            <Col md={4}>
              <div className={styles.dayHeaderCard}>
                <h3>Безналичные</h3>
                <div className={`${styles.dayHeaderValue} ${styles.cashless}`}>{totalCashless.toLocaleString('ru-RU')} ₽</div>
              </div>
            </Col>
            <Col md={4}>
              <div className={styles.dayHeaderCard}>
                <h3>Всего</h3>
                <div className={`${styles.dayHeaderValue} ${styles.card}`}>{totalCard.toLocaleString('ru-RU')} ₽</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Сайдбар */}
        <div className={styles.sidebarSection}>
          {/* Касса */}
          <Card className={`${styles.compactCard} mb-3 ${styles.sidebarCard}`}>
            <Card.Header className={styles.cardHeader}>Касса</Card.Header>
            <Card.Body className={styles.compactBody}>
              <Form.Group className={styles.compactFormGroup}>
                <Form.Label>Касса утро:</Form.Label>
                <Form.Control
                  type="number"
                  value={cashMorning}
                  onChange={(e) => setCashMorning(e.target.value)}
                  placeholder="0"
                  className={styles.compactInput}
                />
              </Form.Group>
              <Form.Group className={styles.compactFormGroup}>
                <Form.Label>Касса вечер:</Form.Label>
                <Form.Control
                  type="number"
                  value={cashEvening}
                  onChange={(e) => setCashEvening(e.target.value)}
                  placeholder="0"
                  className={styles.compactInput}
                />
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Календарь */}
          <Card className={styles.calendarCard}>
            <Card.Header className={styles.calendarHeader}>Календарь</Card.Header>
            <Card.Body className={styles.calendarBody}>
              <div className={styles.calendarGridHeader}>
                {weekDays.map((d) => (
                  <div key={d} className={styles.calendarWeekday}>
                    {d}
                  </div>
                ))}
              </div>
              
              <div className={styles.calendarGrid}>
                {calendarDays.map((cell) => {
                  if (cell.type === 'empty') {
                    return <div key={cell.key} className={`${styles.calendarCell} ${styles.calendarCellEmpty}`}></div>;
                  }
                  
                  return (
                    <button
                      key={cell.key}
                      className={`${styles.calendarCell} ${cell.isToday ? styles.calendarCellToday : ''} ${cell.day === dayNum ? styles.calendarCellSelected : ''}`}
                      onClick={() => navigate(`/day/${cell.day}`)}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>
            </Card.Body>
          </Card>

          {/* Задачи */}
          <Card className={`${styles.compactCard} ${styles.tasksSidebarCard}`}>
            <Card.Header className={styles.cardHeader}>
              <span>Задачи</span>
            </Card.Header>
            <Card.Body className={`${styles.compactBody} ${styles.tasksBody}`}>
              <div className={styles.taskAddRow}>
                <Form.Control
                  type="text"
                  size="sm"
                  placeholder="Новая задача"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyPress={handleTaskKeyPress}
                  className={styles.compactInput}
                />
                <Button
                  variant="primary"
                  size="sm"
                  className={styles.taskAddBtn}
                  onClick={addTask}
                >
                  +
                </Button>
              </div>

              <div className={styles.tasksSidebarList}>
                {tasks.length === 0 ? (
                  <p className="text-muted small mb-0">Нет задач</p>
                ) : (
                  <>
                    {currentTasks.map((task) => (
                      <div key={task.id} className={`${styles.taskSidebarItem} ${task.completed ? styles.taskCompleted : ''}`}>
                        <div className={styles.taskSidebarHeader} onClick={() => setOpenTaskId(openTaskId === task.id ? null : task.id)}>
                          <Form.Check
                            type="checkbox"
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            className={styles.taskSidebarCheckbox}
                          />
                          <span className={styles.taskSidebarText}>{task.text}</span>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className={styles.taskSidebarDelete}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeTask(task.id);
                            }}
                          >
                            ✕
                          </Button>
                        </div>
                        {openTaskId === task.id && (
                          <div className={styles.taskSidebarNotes}>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              size="sm"
                              placeholder="Заметки (необязательно)"
                              value={task.notes || ''}
                              onChange={(e) => updateTaskNotes(task.id, e.target.value)}
                              className={styles.compactInput}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {totalPages > 1 && (
                      <div className={styles.taskPagination}>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          disabled={taskPage === 0}
                          onClick={prevPage}
                          className={styles.taskPageBtn}
                        >
                          ←
                        </Button>
                        <span className={styles.taskPageInfo}>
                          {taskPage + 1} / {totalPages}
                        </span>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          disabled={taskPage === totalPages - 1}
                          onClick={nextPage}
                          className={styles.taskPageBtn}
                        >
                          →
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Списки для автодополнения */}
        <datalist id="sph-options">
          {sphValues.map((val) => (
            <option key={val} value={val} />
          ))}
        </datalist>
        <datalist id="cyl-options">
          {cylValues.map((val) => (
            <option key={val} value={val} />
          ))}
        </datalist>
        <datalist id="ax-options">
          {axValues.map((val) => (
            <option key={val} value={val} />
          ))}
        </datalist>

        {/* Модальное окно подтверждения удаления */}
        <Modal show={showDeleteConfirm} onHide={cancelDelete} centered>
          <Modal.Header closeButton>
            <Modal.Title>Подтвердите действие</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Вы уверены что хотите удалить данный товар?
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={cancelDelete}>
              Отмена
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Удалить
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default DaySheet;
