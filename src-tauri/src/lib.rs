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
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        )",
    )
    .execute(&mut conn)
    .expect("Ошибка создания таблицы users");

    diesel::sql_query(
        "CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            description TEXT NOT NULL,
            completed BOOLEAN NOT NULL DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id)
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
            FOREIGN KEY (user_id) REFERENCES users(id)
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
            FOREIGN KEY (user_id) REFERENCES users(id),
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
            FOREIGN KEY (user_id) REFERENCES users(id)
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

    // Таблица должностей
    diesel::sql_query(
        "CREATE TABLE IF NOT EXISTS positions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL DEFAULT (datetime('now','localtime'))
        )",
    )
    .execute(&mut conn)
    .expect("Ошибка создания таблицы positions");

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
fn create_position(name: &str) -> Position {
    let database_url = get_db_path();
    let mut conn = SqliteConnection::establish(&database_url)
        .expect("Ошибка подключения к базе данных");

    let new_pos = NewPosition { name };
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
fn delete_position(_id: i32) -> bool {
    let database_url = get_db_path();
    let mut conn = SqliteConnection::establish(&database_url)
        .expect("Ошибка подключения к базе данных");

    use schema::positions::dsl::*;
    diesel::delete(positions.filter(id.eq(id)))
        .execute(&mut conn)
        .is_ok()
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
fn delete_staff(_id: i32) -> bool {
    let database_url = get_db_path();
    let mut conn = SqliteConnection::establish(&database_url)
        .expect("Ошибка подключения к базе данных");

    use schema::staff::dsl::*;
    diesel::delete(staff.filter(id.eq(id)))
        .execute(&mut conn)
        .is_ok()
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
            get_staff,
            create_staff,
            delete_staff
        ])
        .run(tauri::generate_context!())
        .expect("Ошибка при запуске приложения");
}