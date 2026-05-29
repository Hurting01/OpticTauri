import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form } from 'react-bootstrap';

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

  // Загрузка задач
  useEffect(() => {
    loadAllTasks();
  }, []);

  const loadAllTasks = async () => {
    const todayTasksList = [];
    const pastTasksList = [];

    // Загружаем задачи за все дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const data = await window.electronAPI.getDayData(day, currentMonth, currentYear);
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
    const data = await window.electronAPI.getDayData(day, currentMonth, currentYear);
    await window.electronAPI.saveDayData(day, currentMonth, currentYear, {
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
      const dayData = await window.electronAPI.getDayData(day, currentMonth, currentYear);
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
    <div className="p-4 fade-in">
      {/* Верхняя панель */}
      <Card className="mb-4 top-panel">
        <Card.Body className="py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h1 className="mb-0 month-title">{monthNames[currentMonth - 1]} {currentYear}</h1>

            <div className="d-flex gap-2 top-buttons">
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
      <div className="main-content-wrapper">
        {/* Левая часть - Задачи на сегодня */}
        <div className="left-section">
          <Card className="tasks-card">
            <Card.Header className="tasks-header app-header">
              Задачи на сегодня
            </Card.Header>
            <Card.Body>
              <div className="tasks-list">
                {todayTasks.length === 0 ? (
                  <p className="text-muted text-center">Нет задач на сегодня</p>
                ) : (
                  todayTasks.map((task) => (
                    <div
                      key={`today-${task.id}`}
                      className={`task-item ${task.completed ? 'task-completed' : ''}`}
                    >
                      <Form.Check
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id, today)}
                        label={task.text}
                        className="task-checkbox"
                      />
                    </div>
                  ))
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Задачи из прошлых дней */}
          {pastTasks.length > 0 && (
            <Card className="tasks-card past-tasks-card">
              <Card.Header className="past-tasks-header app-header">
                Невыполненные задачи из прошлых дней
              </Card.Header>
              <Card.Body>
                <div className="tasks-list">
                  {pastTasks.map((task) => (
                    <div
                      key={`past-${task.id}`}
                      className={`task-item ${task.completed ? 'task-completed' : ''}`}
                    >
                      <div className="task-with-date">
                        <Form.Check
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTask(task.id, task.day)}
                          label={task.text}
                          className="task-checkbox"
                        />
                        <span className="task-date-badge">{task.day} {monthNamesGenitive[currentMonth - 1]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}
        </div>

        {/* Правая часть - компактный календарь */}
        <div className="right-section">
          <Card className="calendar-card">
            <Card.Header className="calendar-header app-header app-header-small">Календарь</Card.Header>
            <Card.Body className="p-2">
              <div className="calendar-grid-header">
                {weekDays.map((day) => (
                  <div key={day} className="calendar-weekday">
                    {day}
                  </div>
                ))}
              </div>

              <div className="calendar-grid">
                {calendarDays.map((cell) => {
                  if (cell.type === 'empty') {
                    return <div key={cell.key} className="calendar-cell calendar-cell-empty"></div>;
                  }

                  return (
                    <button
                      key={cell.key}
                      className={`calendar-cell ${cell.isToday ? 'calendar-cell-today' : ''}`}
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
