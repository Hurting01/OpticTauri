import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form } from 'react-bootstrap';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear] = useState(new Date().getFullYear());
  const [todayTasks, setTodayTasks] = useState([]);
  const [pastTasks, setPastTasks] = useState([]);

  const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

  // Определяем первый день месяца и количество дней
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Создаем массив для календаря
  const calendarDays = [];

  // Пустые ячейки до первого дня
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push({ type: 'empty', key: `empty-${i}` });
  }

  // Дни месяца
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth - 1, day);
    calendarDays.push({
      type: 'day',
      day,
      weekDay: weekDays[date.getDay()],
      isToday: day === new Date().getDate() && currentMonth === new Date().getMonth() + 1,
      key: `day-${day}`
    });
  }

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const monthNamesGenitive = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ];

  const today = new Date().getDate();

  const getDayData = (day) => {
    const value = localStorage.getItem(`day:${currentYear}-${currentMonth}-${day}`);
    return value ? JSON.parse(value) : null;
  };

  const saveDayData = (day, data) => {
    localStorage.setItem(`day:${currentYear}-${currentMonth}-${day}`, JSON.stringify(data));
  };

  // Загрузка задач
  useEffect(() => {
    loadAllTasks();
  }, []);

  const loadAllTasks = async () => {
    const todayTasksList = [];
    const pastTasksList = [];

    // Загружаем задачи за все дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const data = getDayData(day);
      if (data && data.tasks && Array.isArray(data.tasks)) {
        const dayTasks = data.tasks.map(task => ({
          ...task,
          day: day
        }));

        if (day === today) {
          todayTasksList.push(...dayTasks);
        } else if (day < today) {
          pastTasksList.push(...dayTasks);
        }
      }
    }

    // Фильтруем невыполненные задачи из прошлых дней
    const uncompletedPastTasks = pastTasksList.filter(task => !task.completed);

    setTodayTasks(todayTasksList);
    setPastTasks(uncompletedPastTasks);
  };

  const saveTasks = async (tasks, day) => {
    const data = getDayData(day);
    saveDayData(day, {
      ...data,
      tasks
    });
  };

  const toggleTask = async (taskId, day) => {
    if (day === today) {
      // Для задач на сегодня
      const newTasks = todayTasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      setTodayTasks(newTasks);
      await saveTasks(newTasks, day);
    } else {
      // Для задач из прошлых дней
      // 1. Обновляем базу данных конкретного дня
      const dayData = getDayData(day);
      if (dayData && dayData.tasks) {
        const updatedTasks = dayData.tasks.map(task =>
          task.id === taskId ? { ...task, completed: true } : task
        );
        await saveTasks(updatedTasks, day);
      }
      // 2. Убираем задачу из локального списка (так как она выполнена)
      setPastTasks(prev => prev.filter(t => t.id !== taskId));
    }
  };

  return (
    <div className={styles.container}>
      {/* Верхняя панель */}
      <Card className={styles.topPanel}>
        <Card.Body className={styles.topPanelBody}>
          <div className={styles.headerRow}>
            <h1 className={styles.monthTitle}>{monthNames[currentMonth - 1]} {currentYear}</h1>

            <div className={styles.topButtons}>
              <Button variant="light" onClick={() => navigate('/reports')}>
                Отчеты
              </Button>
              <Button variant="light" onClick={() => navigate('/schedule')}>
                График
              </Button>
              <Button variant="light" onClick={() => {}}>
                Касса
              </Button>
              <Button variant="light" onClick={() => navigate('/settings')}>
                Настройки
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Основной контент */}
      <div className={styles.mainContentWrapper}>
        {/* Левая часть - Задачи на сегодня */}
        <div className={styles.leftSection}>
          <Card className={styles.tasksCard}>
            <Card.Header className={styles.tasksHeader}>
              Задачи на сегодня
            </Card.Header>
            <Card.Body>
              <div className={styles.tasksList}>
                {todayTasks.length === 0 ? (
                  <p className="text-muted text-center">Нет задач на сегодня</p>
                ) : (
                  todayTasks.map((task) => (
                    <div
                      key={`today-${task.id}`}
                      className={`${styles.taskItem} ${task.completed ? styles.taskCompleted : ''}`}
                    >
                      <Form.Check
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id, today)}
                        label={task.text}
                        className={styles.taskCheckbox}
                      />
                    </div>
                  ))
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Задачи из прошлых дней */}
          {pastTasks.length > 0 && (
            <Card className={`${styles.tasksCard} ${styles.pastTasksCard}`}>
              <Card.Header className={styles.pastTasksHeader}>
                Невыполненные задачи из прошлых дней
              </Card.Header>
              <Card.Body>
                <div className={styles.tasksList}>
                  {pastTasks.map((task) => (
                    <div
                      key={`past-${task.id}`}
                      className={`${styles.taskItem} ${task.completed ? styles.taskCompleted : ''}`}
                    >
                      <div className={styles.taskWithDate}>
                        <Form.Check
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id, task.day)}
                          label={task.text}
                          className={styles.taskCheckbox}
                        />
                        <span className={styles.taskDateBadge}>{task.day} {monthNamesGenitive[currentMonth - 1]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Правая часть - компактный календарь */}
        <div className={styles.rightSection}>
          <Card className={styles.calendarCard}>
            <Card.Header className={styles.calendarHeader}>Календарь</Card.Header>
            <Card.Body className={styles.calendarBody}>
              <div className={styles.calendarGridHeader}>
                {weekDays.map((day) => (
                  <div key={day} className={styles.calendarWeekday}>
                    {day}
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
                      className={`${styles.calendarCell} ${cell.isToday ? styles.calendarCellToday : ''}`}
                      onClick={() => navigate(`/day/${cell.day}`)}
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
