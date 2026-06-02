mod models;
mod schema;

use diesel::prelude::*;
use diesel::sqlite::SqliteConnection;
use models::{Position, Staff, NewPosition, NewStaff};

fn run_migrations() {
    let database_url = std::path::Path::new(&std::env::current_dir().unwrap_or_default())
        .join("erp.db");
    let database_url = database_url.to_string_lossy().to_string();

    let mut conn = SqliteConnection::establish(&database_url)
        .expect("Ошибка подключения к базе данных");

    diesel::sql_query(
        "CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            description TEXT NOT NULL,
            completed BOOLEAN NOT NULL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES staff(id)
        )",
    )
    .execute(&mut conn)
    .expect("Ошибка создания таблицы tasks");

    diesel::sql_query(
        "CREATE TABLE IF NOT EXISTS sales (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            datetime TEXT NOT NULL,
            product_name TEXT NOT NULL,
            recipe TEXT,
            total_amount REAL NOT NULL,
            advance_amount REAL NOT NULL DEFAULT 0,
            cash_amount REAL NOT NULL DEFAULT 0,
            card_amount REAL NOT NULL DEFAULT 0,
            sbp_amount REAL NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        )",
    )
    .execute(&mut conn)
    .expect("Ошибка создания таблицы sales");

    diesel::sql_query(
        "CREATE TABLE IF NOT EXISTS daily_workers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            worker_name TEXT NOT NULL,
            shift TEXT
        )",
    )
    .execute(&mut conn)
    .expect("Ошибка создания таблицы daily_workers");

    diesel::sql_query(
        "CREATE TABLE IF NOT EXISTS total_income (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            total_sum REAL NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        )",
    )
    .execute(&mut conn)
    .expect("Ошибка создания таблицы total_income");

    diesel::sql_query(
        "CREATE TABLE IF NOT EXISTS cash_register (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            morning_amount REAL NOT NULL,
            evening_amount REAL NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        )",
    )
    .execute(&mut conn)
    .expect("Ошибка создания таблицы cash_register");

    diesel::sql_query(
        "CREATE TABLE IF NOT EXISTS cash_operations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            operation_type TEXT NOT NULL,
            amount REAL NOT NULL,
            description TEXT,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        )",
    )
    .execute(&mut conn)
    .expect("Ошибка создания таблицы cash_operations");

    diesel::sql_query(
        "CREATE TABLE IF NOT EXISTS schedule (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            shift TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES staff(id)
        )",
    )
    .execute(&mut conn)
    .expect("Ошибка создания таблицы schedule");

    diesel::sql_query(
        "CREATE TABLE IF NOT EXISTS bonuses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            sale_id INTEGER,
            amount REAL NOT NULL,
            date TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
            FOREIGN KEY (user_id) REFERENCES staff(id),
            FOREIGN KEY (sale_id) REFERENCES sales(id)
        )",
    )
    .execute(&mut conn)
    .expect("Ошибка создания таблицы bonuses");

    diesel::sql_query(
        "CREATE TABLE IF NOT EXISTS conversion (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL UNIQUE,
            visitors_count INTEGER NOT NULL DEFAULT 0,
            sales_count INTEGER NOT NULL DEFAULT 0,
            orders_count INTEGER NOT NULL DEFAULT 0,
            diagnostics_count INTEGER NOT NULL DEFAULT 0,
            turnover REAL NOT NULL DEFAULT 0,
            conversion_vs_last_year REAL,
            conversion_vs_last_month REAL,
            conversion_vs_last_week REAL,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        )",
    )
    .execute(&mut conn)
    .expect("Ошибка создания таблицы conversion");

    diesel::sql_query(
        "CREATE TABLE IF NOT EXISTS monthly_plan (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year INTEGER NOT NULL,
            month INTEGER NOT NULL,
            orders_plan REAL NOT NULL,
            turnover_plan REAL NOT NULL,
            orders_actual REAL NOT NULL DEFAULT 0,
            turnover_actual REAL NOT NULL DEFAULT 0,
            daily_orders_plan REAL,
            daily_orders_actual REAL DEFAULT 0,
            daily_turnover_plan REAL,
            daily_turnover_actual REAL DEFAULT 0,
            remaining_orders REAL,
            remaining_turnover REAL,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        )",
    )
    .execute(&mut conn)
    .expect("Ошибка создания таблицы monthly_plan");

    diesel::sql_query(
        "CREATE TABLE IF NOT EXISTS weekday_analysis (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year INTEGER NOT NULL,
            month INTEGER NOT NULL,
            weekday INTEGER NOT NULL,
            total_sales REAL NOT NULL DEFAULT 0,
            order_count INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        )",
    )
    .execute(&mut conn)
    .expect("Ошибка создания таблицы weekday_analysis");

    diesel::sql_query(
        "CREATE TABLE IF NOT EXISTS conversion_notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            conversion_date TEXT NOT NULL,
            note TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
            FOREIGN KEY (conversion_date) REFERENCES conversion(date)
        )",
    )
    .execute(&mut conn)
    .expect("Ошибка создания таблицы conversion_notes");

    diesel::sql_query(
        "CREATE TABLE IF NOT EXISTS salary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            month TEXT NOT NULL,
            base_salary REAL NOT NULL,
            bonus REAL NOT NULL DEFAULT 0,
            deductions REAL NOT NULL DEFAULT 0,
            total_salary REAL NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
            FOREIGN KEY (user_id) REFERENCES staff(id)
        )",
    )
    .execute(&mut conn)
    .expect("Ошибка создания таблицы salary");

    diesel::sql_query(
        "CREATE TABLE IF NOT EXISTS realized_positions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_name TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            total_amount REAL NOT NULL,
            month TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        )",
    )
    .execute(&mut conn)
    .expect("Ошибка создания таблицы realized_positions");

    diesel::sql_query(
        "CREATE TABLE IF NOT EXISTS position_counts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            product_name TEXT NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        )",
    )
    .execute(&mut conn)
    .expect("Ошибка создания таблицы position_counts");

    // Таблица должностей - миграция со старой структуры на новую
    // Проверяем существование таблицы через прямой SQL
    #[derive(QueryableByName)]
    struct TableCount {
        #[diesel(sql_type = diesel::sql_types::BigInt)]
        cnt: i64,
    }

    /// Возвращает true, если в таблице `table_name` есть колонка с именем `column_name`.
    fn has_column(table_name: &str, column_name: &str, conn: &mut SqliteConnection) -> bool {
        // Имя таблицы и колонки подставляем через format!, так как sqlite_master
        // и pragma не поддерживают bind-параметры. Имена берутся из констант
        // проекта, а не из пользовательского ввода, поэтому это безопасно.
        let safe_table = table_name.replace('"', "\"\"");
        let safe_col = column_name.replace('"', "\"\"");
        // Считаем строки через `SELECT COUNT(*)` — так Diesel десериализует
        // только одно числовое поле в `TableCount` (см. выше), и нам не нужно
        // объявлять отдельную структуру под имя колонки.
        let sql = format!(
            "SELECT COUNT(*) AS cnt FROM pragma_table_info(\"{}\") WHERE name = '{}'",
            safe_table, safe_col
        );
        diesel::sql_query(sql)
            .load::<TableCount>(conn)
            .map(|rows| rows.first().map(|r| r.cnt > 0).unwrap_or(false))
            .unwrap_or(false)
    }

    let table_exists: bool = diesel::sql_query(
        "SELECT COUNT(*) as cnt FROM sqlite_master WHERE type='table' AND name='positions'"
    )
    .load::<TableCount>(&mut conn)
    .map(|results| results.first().map(|r| r.cnt > 0).unwrap_or(false))
    .unwrap_or(false);

    if !table_exists {
        // Создаём таблицу с правильной структурой
        diesel::sql_query(
            "CREATE TABLE positions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
                norm_hours INTEGER,
                hours_per_shift REAL DEFAULT 12,
                salary INTEGER,
                additional_payments REAL DEFAULT 5000
            )"
        )
        .execute(&mut conn)
        .expect("Ошибка создания таблицы positions");
        println!("✅ Таблица positions создана");
    } else {
        // Проверяем наличие старых колонок через PRAGMA, а не через слепой SELECT.
        // SELECT несуществующего столбца через Diesel::sql_query().execute()
        // может возвращать Ok на некоторых версиях, что приводило к ложному
        // срабатыванию блока миграции и панике "no such column: sallary".
        let has_hour_norm = has_column("positions", "Hour_norm", &mut conn);
        let has_sallary = has_column("positions", "sallary", &mut conn);
        let has_sallary_bonus_space = has_column("positions", "sallary bonus", &mut conn);
        let has_sallary_bonus = has_column("positions", "sallary_bonus", &mut conn);
        let has_norm_hours_consultant = has_column("positions", "norm_hours_consultant", &mut conn);
        let has_norm_hours_optometrist = has_column("positions", "norm_hours_optometrist", &mut conn);
        let has_norm_hours = has_column("positions", "norm_hours", &mut conn);
        let has_salary_consultant = has_column("positions", "salary_consultant", &mut conn);
        let has_salary_optometrist = has_column("positions", "salary_optometrist", &mut conn);
        let has_salary = has_column("positions", "salary", &mut conn);
        let has_additional_payments = has_column("positions", "additional_payments", &mut conn);
        let has_manager_bonus = has_column("positions", "manager_bonus", &mut conn);

        let has_any_old_column = has_hour_norm
            || has_sallary
            || has_sallary_bonus_space
            || has_sallary_bonus
            || has_norm_hours_consultant
            || has_norm_hours_optometrist;

        if has_any_old_column {
            println!("🔄 Начинаем миграцию таблицы positions...");

            // Временно отключаем проверку внешних ключей
            diesel::sql_query("PRAGMA foreign_keys = OFF")
                .execute(&mut conn)
                .expect("Ошибка отключения FK");

            // Удаляем временную таблицу если она осталась от предыдущей миграции
            diesel::sql_query("DROP TABLE IF EXISTS positions_new")
                .execute(&mut conn)
                .ok();

            // Создаём временную таблицу с правильной структурой
            diesel::sql_query(
                "CREATE TABLE positions_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE,
                    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
                    norm_hours INTEGER,
                    hours_per_shift REAL DEFAULT 12,
                    salary INTEGER,
                    additional_payments REAL DEFAULT 5000
                )"
            )
            .execute(&mut conn)
            .expect("Ошибка создания таблицы positions_new");

            // Копируем данные, обращаясь к старым колонкам только если они существуют.
            // Несоответствующие колонки заменяются на NULL/дефолты, чтобы не
            // получать ошибку "no such column" при повторной миграции.
            // В норму часов записываем первое непустое значение из старых колонок
            // (норма_консультант или норма_оптометрист или Hour_norm).
            let norm_hours_expr = if has_norm_hours_consultant {
                "COALESCE(norm_hours_consultant, norm_hours_optometrist)"
            } else if has_hour_norm {
                "\"Hour_norm\""
            } else {
                "NULL"
            };
            // Для новой колонки salary берём максимум из старых значений,
            // чтобы не потерять данные ни по консультанту, ни по оптометристу.
            let salary_expr = if has_salary_consultant && has_salary_optometrist {
                "COALESCE(MAX(salary_consultant, salary_optometrist), 0)"
            } else if has_salary_consultant {
                "COALESCE(salary_consultant, 0)"
            } else if has_salary_optometrist {
                "COALESCE(salary_optometrist, 0)"
            } else if has_sallary {
                "COALESCE(sallary, 0)"
            } else {
                "0"
            };
            let additional_payments_expr = if has_sallary_bonus_space {
                "\"sallary bonus\""
            } else if has_sallary_bonus {
                "sallary_bonus"
            } else if has_manager_bonus {
                "manager_bonus"
            } else {
                "5000"
            };

            let copy_sql = format!(
                "INSERT INTO positions_new (id, name, created_at, norm_hours, hours_per_shift, salary, additional_payments)
                 SELECT id, name, created_at, {}, hours_per_shift, {}, {}
                 FROM positions",
                norm_hours_expr, salary_expr, additional_payments_expr
            );

            diesel::sql_query(copy_sql)
                .execute(&mut conn)
                .expect("Ошибка копирования данных positions");

            // Удаляем старую таблицу
            diesel::sql_query("DROP TABLE positions")
                .execute(&mut conn)
                .expect("Ошибка удаления старой таблицы positions");

            // Переименовываем новую таблицу
            diesel::sql_query("ALTER TABLE positions_new RENAME TO positions")
                .execute(&mut conn)
                .expect("Ошибка переименования таблицы positions_new");

            // Включаем проверку внешних ключей обратно
            diesel::sql_query("PRAGMA foreign_keys = ON")
                .execute(&mut conn)
                .expect("Ошибка включения FK");

            println!("✅ Таблица positions мигрирована: исправлены имена столбцов");
        } else {
            // Таблица уже имеет новую структуру, убеждаемся, что все нужные колонки существуют.
            if !has_norm_hours {
                println!("🔄 Добавляем столбец norm_hours в positions...");
                diesel::sql_query("ALTER TABLE positions ADD COLUMN norm_hours INTEGER")
                    .execute(&mut conn)
                    .ok();
            }

            // Если раньше использовались две раздельные колонки зарплаты,
            // а новой колонки `salary` ещё нет — добавляем её и мигрируем
            // данные, взяв максимум из двух старых значений.
            if !has_salary {
                println!("🔄 Добавляем столбец salary в positions...");
                diesel::sql_query("ALTER TABLE positions ADD COLUMN salary INTEGER")
                    .execute(&mut conn)
                    .expect("Ошибка добавления столбца salary");
            }

            if has_salary_consultant || has_salary_optometrist {
                let migrate_sql = if has_salary_consultant && has_salary_optometrist {
                    "UPDATE positions SET salary = COALESCE(MAX(salary_consultant, salary_optometrist), 0) \
                     WHERE salary IS NULL OR typeof(salary) = 'text'"
                } else if has_salary_consultant {
                    "UPDATE positions SET salary = COALESCE(salary_consultant, 0) \
                     WHERE salary IS NULL OR typeof(salary) = 'text'"
                } else {
                    "UPDATE positions SET salary = COALESCE(salary_optometrist, 0) \
                     WHERE salary IS NULL OR typeof(salary) = 'text'"
                };
                diesel::sql_query(migrate_sql)
                    .execute(&mut conn)
                    .ok();
            }

            if !has_additional_payments {
                println!("🔄 Добавляем столбец additional_payments в positions...");
                diesel::sql_query("ALTER TABLE positions ADD COLUMN additional_payments REAL DEFAULT 5000")
                    .execute(&mut conn)
                    .ok();
            }

            // Если в БД остался старый столбец manager_bonus (из предыдущей
            // версии схемы) — переносим данные в additional_payments и удаляем его,
            // чтобы новая схема была единственным источником истины.
            if has_manager_bonus {
                diesel::sql_query(
                    "UPDATE positions
                     SET additional_payments = manager_bonus
                     WHERE additional_payments IS NULL AND manager_bonus IS NOT NULL",
                )
                .execute(&mut conn)
                .ok();

                // SQLite < 3.35 не поддерживает DROP COLUMN, поэтому
                // пересоздаём таблицу без старого столбца.
                if has_column("positions", "id", &mut conn) {
                    diesel::sql_query("PRAGMA foreign_keys = OFF")
                        .execute(&mut conn)
                        .ok();
                    diesel::sql_query("DROP TABLE IF EXISTS positions_migrate")
                        .execute(&mut conn)
                        .ok();
                    diesel::sql_query(
                        "CREATE TABLE positions_migrate (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            name TEXT NOT NULL UNIQUE,
                            created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
                            norm_hours INTEGER,
                            hours_per_shift REAL DEFAULT 12,
                            salary INTEGER,
                            additional_payments REAL DEFAULT 5000
                        )",
                    )
                    .execute(&mut conn)
                    .ok();
                    diesel::sql_query(
                        "INSERT INTO positions_migrate
                            (id, name, created_at, norm_hours, hours_per_shift, salary, additional_payments)
                         SELECT id, name, created_at, norm_hours, hours_per_shift,
                                COALESCE(salary, 0),
                                COALESCE(additional_payments, 5000)
                         FROM positions",
                    )
                    .execute(&mut conn)
                    .ok();
                    diesel::sql_query("DROP TABLE positions")
                        .execute(&mut conn)
                        .ok();
                    diesel::sql_query("ALTER TABLE positions_migrate RENAME TO positions")
                        .execute(&mut conn)
                        .ok();
                    diesel::sql_query("PRAGMA foreign_keys = ON")
                        .execute(&mut conn)
                        .ok();
                }
            }
        }

        // Защитная очистка данных: после некорректной миграции значения
        // могут оказаться нечисловыми (например, строка "sallary bonus"
        // попала в колонку additional_payments). Приводим такие значения к NULL
        // и заполняем дефолтами, чтобы приложение не падало при чтении.
        diesel::sql_query(
            "UPDATE positions
             SET additional_payments = 5000
             WHERE typeof(additional_payments) = 'text' OR additional_payments IS NULL"
        )
        .execute(&mut conn)
        .ok();

        diesel::sql_query(
            "UPDATE positions
             SET salary = COALESCE(salary, 0)
             WHERE typeof(salary) = 'text' OR salary IS NULL"
        )
        .execute(&mut conn)
        .ok();
    }

    // Удаляем старую таблицу users если она существует
    diesel::sql_query("DROP TABLE IF EXISTS users")
        .execute(&mut conn)
        .expect("Ошибка удаления таблицы users");

    // Таблица персонала
    diesel::sql_query(
        "CREATE TABLE IF NOT EXISTS staff (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            position_id INTEGER NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime')),
            FOREIGN KEY (position_id) REFERENCES positions(id)
        )",
    )
    .execute(&mut conn)
    .expect("Ошибка создания таблицы staff");

    println!("✅ Все миграции применены успешно");
}

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Привет, {}! Ты был поприветствован из Rust!", name)
}

fn get_db_path() -> String {
    let database_url = std::path::Path::new(&std::env::current_dir().unwrap_or_default())
        .join("erp.db");
    database_url.to_string_lossy().to_string()
}

// === Команды для должностей ===

#[tauri::command]
fn get_positions() -> Vec<Position> {
    let database_url = get_db_path();
    let mut conn = SqliteConnection::establish(&database_url)
        .expect("Ошибка подключения к базе данных");

    use schema::positions::dsl::*;
    positions.load::<Position>(&mut conn).unwrap_or_default()
}

#[tauri::command]
fn create_position(
    name: &str,
    norm_hours: Option<i32>,
    hours_per_shift: Option<f64>,
    salary: Option<i32>,
    additional_payments: Option<f64>,
) -> Position {
    let database_url = get_db_path();
    let mut conn = SqliteConnection::establish(&database_url)
        .expect("Ошибка подключения к базе данных");

    let new_pos = NewPosition {
        name,
        norm_hours,
        hours_per_shift,
        salary,
        additional_payments,
    };
    diesel::insert_into(schema::positions::table)
        .values(&new_pos)
        .execute(&mut conn)
        .expect("Ошибка создания должности");

    schema::positions::table
        .order(schema::positions::id.desc())
        .first(&mut conn)
        .unwrap()
}

#[tauri::command]
fn delete_position(position_id: i32) -> bool {
    let database_url = get_db_path();
    let mut conn = SqliteConnection::establish(&database_url)
        .expect("Ошибка подключения к базе данных");

    use schema::positions::dsl::*;
    diesel::delete(positions.filter(id.eq(position_id)))
        .execute(&mut conn)
        .is_ok()
}

#[tauri::command]
fn update_position(
    position_id: i32,
    position_name: &str,
    new_norm_hours: Option<i32>,
    new_hours_per_shift: Option<f64>,
    new_salary: Option<i32>,
    new_additional_payments: Option<f64>,
) -> Position {
    let database_url = get_db_path();
    let mut conn = SqliteConnection::establish(&database_url)
        .expect("Ошибка подключения к базе данных");

    use schema::positions::dsl::*;
    diesel::update(positions.filter(id.eq(position_id)))
        .set((
            name.eq(position_name),
            norm_hours.eq(new_norm_hours),
            hours_per_shift.eq(new_hours_per_shift),
            salary.eq(new_salary),
            additional_payments.eq(new_additional_payments),
        ))
        .execute(&mut conn)
        .expect("Ошибка обновления должности");

    positions.filter(id.eq(position_id))
        .first(&mut conn)
        .unwrap()
}

// === Команды для персонала ===

#[tauri::command]
fn get_staff() -> Vec<Staff> {
    let database_url = get_db_path();
    let mut conn = SqliteConnection::establish(&database_url)
        .expect("Ошибка подключения к базе данных");

    use schema::staff::dsl::*;
    staff.load::<Staff>(&mut conn).unwrap_or_default()
}

#[tauri::command]
fn create_staff(full_name: &str, position_id: i32) -> Staff {
    let database_url = get_db_path();
    let mut conn = SqliteConnection::establish(&database_url)
        .expect("Ошибка подключения к базе данных");

    let new_staff = NewStaff { full_name, position_id };
    diesel::insert_into(schema::staff::table)
        .values(&new_staff)
        .execute(&mut conn)
        .expect("Ошибка создания сотрудника");

    schema::staff::table
        .order(schema::staff::id.desc())
        .first(&mut conn)
        .unwrap()
}

#[tauri::command]
fn delete_staff(staff_id: i32) -> bool {
    let database_url = get_db_path();
    let mut conn = SqliteConnection::establish(&database_url)
        .expect("Ошибка подключения к базе данных");

    use schema::staff::dsl::*;
    diesel::delete(staff.filter(id.eq(staff_id)))
        .execute(&mut conn)
        .is_ok()
}

#[tauri::command]
fn update_staff(staff_id: i32, new_full_name: &str, new_position_id: i32) -> Staff {
    let database_url = get_db_path();
    let mut conn = SqliteConnection::establish(&database_url)
        .expect("Ошибка подключения к базе данных");

    use schema::staff::dsl::*;
    diesel::update(staff.filter(id.eq(staff_id)))
        .set((full_name.eq(new_full_name), position_id.eq(new_position_id)))
        .execute(&mut conn)
        .expect("Ошибка обновления сотрудника");

    staff.filter(id.eq(staff_id))
        .first(&mut conn)
        .unwrap()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    run_migrations();
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            get_positions,
            create_position,
            delete_position,
            update_position,
            get_staff,
            create_staff,
            delete_staff,
            update_staff
        ])
        .run(tauri::generate_context!())
        .expect("Ошибка при запуске приложения");
}
