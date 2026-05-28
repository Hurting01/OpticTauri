import { useState, useEffect } from 'react';
import { Card, Container, Button, Modal, Form } from 'react-bootstrap';
import NavigationHeader from './components/NavigationHeader';
import EmployeesService from './employeesService';
import styles from './Schedule.module.css';

const Schedule = ({ month, year }) => {
  const [scheduleData, setScheduleData] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  useEffect(() => {
    // Получаем количество дней в месяце
    const days = new Date(year, month, 0).getDate();
    setDaysInMonth(days);

    // Загружаем данные расписания (заглушка)
    loadScheduleData();
  }, [month, year]);

  const loadScheduleData = async () => {
    // Заглушка: пример данных расписания
    const mockData = [
      {
        id: 1,
        name: 'Письминская Ю.',
        schedule: {
          1: '1', 3: '1', 5: '1', 6: '1', 9: '1', 10: '1', 12: '1', 13: '1', 14: '1',
          16: '1', 17: '1', 19: '1', 20: '1', 23: '1', 24: '1', 26: '1', 27: '1', 29: '1'
        },
        hours: 192.0,
        days: 16,
        serviceType: 'Оптик-консультанты с 10.00 до 22.00'
      },
      {
        id: 2,
        name: 'Каргина Е.',
        schedule: {
          1: '1', 2: '1', 4: '1', 5: '1', 8: '1', 9: '1', 12: '1', 15: '1', 17: '1',
          18: '1', 21: '1', 22: '1', 25: '1', 26: '1', 29: '1', 30: '1'
        },
        hours: 150.0,
        days: 15,
        serviceType: 'Оптометристы с 10.00 до 20.00'
      },
      {
        id: 3,
        name: 'Липенкова Т.',
        schedule: {
          1: '1', 2: '1', 4: '1', 5: '1', 8: '1', 9: '1', 12: '1', 13: '1', 14: '1',
          15: '1', 18: '1', 19: '1', 22: '1', 23: '1', 26: '1', 27: '1', 28: '1', 29: '1'
        },
        hours: 170.0,
        days: 17,
        serviceType: 'Оптометристы с 10.00 до 20.00'
      },
      {
        id: 4,
        name: 'Машалова Т.',
        schedule: {
          1: '1', 2: 'к', 3: '1', 6: '1', 7: '1', 8: 'к', 9: '1', 10: '1', 13: '1',
          14: 'к', 17: '1', 18: '1', 19: '1', 20: '1', 23: 'к', 24: 'к', 27: '1', 28: '1', 29: 'к', 30: 'к', 31: '1'
        },
        hours: 140.0,
        days: 14,
        serviceType: 'Оптометристы с 10.00 до 20.00'
      },
      {
        id: 5,
        name: 'Письминский А.',
        schedule: {
          1: 'Я', 5: 'Я', 6: 'Я', 7: 'Я', 8: 'Я', 11: 'Я', 12: 'Я', 16: 'Я', 17: 'Я',
          21: 'Я', 22: 'Я', 26: 'о', 27: 'о', 28: 'Я'
        },
        hours: 0.0,
        days: 0,
        serviceType: 'Оптометристы с 10.00 до 20.00'
      }
    ];

    setScheduleData(mockData);
  };

  const loadEmployees = async () => {
    setIsLoadingEmployees(true);
    const data = await EmployeesService.getEmployees(true);
    setEmployees(data);
    setIsLoadingEmployees(false);
  };

  const handleOpenModal = () => {
    loadEmployees();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEmployee('');
  };

  const handleAddRecord = () => {
    if (!selectedEmployee) return;
    console.log('Добавить запись для сотрудника:', selectedEmployee);
    handleCloseModal();
  };

  const getDayOfWeek = (day) => {
    const date = new Date(year, month - 1, day);
    return weekDays[date.getDay()];
  };

  const getScheduleValue = (employee, day) => {
    return employee.schedule[day] || '';
  };

  const getTotalHours = (employee) => {
    return employee.hours.toFixed(1);
  };

  const getTotalDays = (employee) => {
    return employee.days;
  };

  return (
    <div className="p-4 fade-in">
      <NavigationHeader title="📈 График" />

      <Container fluid className="p-0">
        {/* Заголовок */}
        <Card className={styles.headerCard}>
          <Card.Body className="py-3">
            <div className="d-flex justify-content-between align-items-center">
              <h1 className={styles.pageTitle}>
                📅 График — {monthNames[month - 1]} {year}
              </h1>
              <Button variant="primary" onClick={handleOpenModal} className={styles.addButton}>
                + Добавить запись
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Таблица расписания */}
        <Card className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.scheduleTable}>
              <thead>
                <tr className={styles.headerRow}>
                  <th className={styles.nameColumn}>
                    <span className={styles.monthLabel}>Март</span>
                  </th>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                    <th key={day} className={styles.dayHeader}>
                      <div className={styles.dayNumber}>{day}</div>
                      <div className={styles.dayOfWeek}>{getDayOfWeek(day)}</div>
                    </th>
                  ))}
                  <th className={styles.hoursColumn}>Часы</th>
                  <th className={styles.daysColumn}>Дни</th>
                </tr>
              </thead>
              <tbody>
                {/* Строка с типом услуги */}
                {scheduleData.length > 0 && (
                  <tr className={styles.serviceTypeRow}>
                    <td colSpan={daysInMonth + 3} className={styles.serviceTypeCell}>
                      {scheduleData[0].serviceType}
                    </td>
                  </tr>
                )}

                {/* Строки сотрудников */}
                {scheduleData.map((employee, index) => (
                  <tr key={employee.id} className={styles.employeeRow}>
                    <td className={styles.employeeName}>{employee.name}</td>
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                      <td key={`${employee.id}-${day}`} className={styles.scheduleCell}>
                        {getScheduleValue(employee, day)}
                      </td>
                    ))}
                    <td className={styles.hoursCell}>{getTotalHours(employee)}</td>
                    <td className={styles.daysCell}>{getTotalDays(employee)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Легенда */}
        <Card className={styles.legendCard}>
          <Card.Body className={styles.legendBody}>
            <div className={styles.legendItem}>
              <span className={styles.legendLabel}>1</span>
              <span>— рабочий день</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendLabel}>к</span>
              <span>— командировка</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendLabel}>Я</span>
              <span>— отпуск</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendLabel}>о</span>
              <span>— выходной</span>
            </div>
          </Card.Body>
        </Card>

        <Modal show={showModal} onHide={handleCloseModal} centered>
          <Modal.Header closeButton>
            <Modal.Title>Добавить запись</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group>
                <Form.Label>Сотрудник</Form.Label>
                <Form.Select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  disabled={isLoadingEmployees}
                >
                  <option value="">Выберите сотрудника</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.lastName} {emp.firstName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Отмена
            </Button>
            <Button
              variant="primary"
              onClick={handleAddRecord}
              disabled={!selectedEmployee}
            >
              Добавить
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Schedule;
