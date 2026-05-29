use diesel::prelude::*;
use serde::{Serialize, Deserialize};

// === Таблица tasks ===

#[derive(Queryable, Selectable, Identifiable, Associations, Debug, Clone)]
#[diesel(belongs_to(Staff, foreign_key = user_id))]
#[diesel(table_name = crate::schema::tasks)]
pub struct Task {
    pub id: i32,
    pub user_id: i32,
    pub date: String,
    pub description: String,
    pub completed: bool,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::tasks)]
pub struct NewTask<'a> {
    pub user_id: i32,
    pub date: &'a str,
    pub description: &'a str,
}

// === Таблица sales ===

#[derive(Queryable, Selectable, Identifiable, Debug, Clone)]
#[diesel(table_name = crate::schema::sales)]
pub struct Sale {
    pub id: i32,
    pub datetime: String,
    pub product_name: String,
    pub recipe: Option<String>,
    pub total_amount: f64,
    pub advance_amount: f64,
    pub cash_amount: f64,
    pub card_amount: f64,
    pub sbp_amount: f64,
    pub created_at: String,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::sales)]
pub struct NewSale<'a> {
    pub datetime: &'a str,
    pub product_name: &'a str,
    pub recipe: Option<&'a str>,
    pub total_amount: f64,
    pub advance_amount: f64,
    pub cash_amount: f64,
    pub card_amount: f64,
    pub sbp_amount: f64,
}

// === Таблица daily_workers ===

#[derive(Queryable, Selectable, Identifiable, Debug, Clone)]
#[diesel(table_name = crate::schema::daily_workers)]
pub struct DailyWorker {
    pub id: i32,
    pub date: String,
    pub worker_name: String,
    pub shift: Option<String>,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::daily_workers)]
pub struct NewDailyWorker<'a> {
    pub date: &'a str,
    pub worker_name: &'a str,
    pub shift: Option<&'a str>,
}

// === Таблица total_income ===

#[derive(Queryable, Selectable, Identifiable, Debug, Clone)]
#[diesel(table_name = crate::schema::total_income)]
pub struct TotalIncome {
    pub id: i32,
    pub date: String,
    pub total_sum: f64,
    pub created_at: String,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::total_income)]
pub struct NewTotalIncome<'a> {
    pub date: &'a str,
    pub total_sum: f64,
}

// === Таблица cash_register ===

#[derive(Queryable, Selectable, Identifiable, Debug, Clone)]
#[diesel(table_name = crate::schema::cash_register)]
pub struct CashRegister {
    pub id: i32,
    pub date: String,
    pub morning_amount: f64,
    pub evening_amount: f64,
    pub created_at: String,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::cash_register)]
pub struct NewCashRegister<'a> {
    pub date: &'a str,
    pub morning_amount: f64,
    pub evening_amount: f64,
}

// === Таблица cash_operations ===

#[derive(Queryable, Selectable, Identifiable, Debug, Clone)]
#[diesel(table_name = crate::schema::cash_operations)]
pub struct CashOperation {
    pub id: i32,
    pub date: String,
    pub operation_type: String,
    pub amount: f64,
    pub description: Option<String>,
    pub created_at: String,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::cash_operations)]
pub struct NewCashOperation<'a> {
    pub date: &'a str,
    pub operation_type: &'a str,
    pub amount: f64,
    pub description: Option<&'a str>,
}

// === Таблица schedule ===

#[derive(Queryable, Selectable, Identifiable, Associations, Debug, Clone)]
#[diesel(belongs_to(Staff, foreign_key = user_id))]
#[diesel(table_name = crate::schema::schedule)]
pub struct Schedule {
    pub id: i32,
    pub user_id: i32,
    pub date: String,
    pub shift: String,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::schedule)]
pub struct NewSchedule<'a> {
    pub user_id: i32,
    pub date: &'a str,
    pub shift: &'a str,
}

// === Таблица bonuses ===

#[derive(Queryable, Selectable, Identifiable, Associations, Debug, Clone)]
#[diesel(belongs_to(Staff, foreign_key = user_id))]
#[diesel(table_name = crate::schema::bonuses)]
pub struct Bonus {
    pub id: i32,
    pub user_id: i32,
    pub sale_id: Option<i32>,
    pub amount: f64,
    pub date: String,
    pub created_at: String,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::bonuses)]
pub struct NewBonus<'a> {
    pub user_id: i32,
    pub sale_id: Option<i32>,
    pub amount: f64,
    pub date: &'a str,
}

// === Таблица conversion ===

#[derive(Queryable, Selectable, Identifiable, Debug, Clone)]
#[diesel(table_name = crate::schema::conversion)]
pub struct Conversion {
    pub id: i32,
    pub date: String,
    pub visitors_count: i32,
    pub sales_count: i32,
    pub orders_count: i32,
    pub diagnostics_count: i32,
    pub turnover: f64,
    pub conversion_vs_last_year: Option<f64>,
    pub conversion_vs_last_month: Option<f64>,
    pub conversion_vs_last_week: Option<f64>,
    pub created_at: String,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::conversion)]
pub struct NewConversion {
    pub date: String,
    pub visitors_count: i32,
    pub sales_count: i32,
    pub orders_count: i32,
    pub diagnostics_count: i32,
    pub turnover: f64,
}

// === Таблица monthly_plan ===

#[derive(Queryable, Selectable, Identifiable, Debug, Clone)]
#[diesel(table_name = crate::schema::monthly_plan)]
pub struct MonthlyPlan {
    pub id: i32,
    pub year: i32,
    pub month: i32,
    pub orders_plan: f64,
    pub turnover_plan: f64,
    pub orders_actual: f64,
    pub turnover_actual: f64,
    pub daily_orders_plan: Option<f64>,
    pub daily_orders_actual: f64,
    pub daily_turnover_plan: Option<f64>,
    pub daily_turnover_actual: f64,
    pub remaining_orders: Option<f64>,
    pub remaining_turnover: Option<f64>,
    pub created_at: String,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::monthly_plan)]
pub struct NewMonthlyPlan {
    pub year: i32,
    pub month: i32,
    pub orders_plan: f64,
    pub turnover_plan: f64,
}

// === Таблица weekday_analysis ===

#[derive(Queryable, Selectable, Identifiable, Debug, Clone)]
#[diesel(table_name = crate::schema::weekday_analysis)]
pub struct WeekdayAnalysis {
    pub id: i32,
    pub year: i32,
    pub month: i32,
    pub weekday: i32,
    pub total_sales: f64,
    pub order_count: i32,
    pub created_at: String,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::weekday_analysis)]
pub struct NewWeekdayAnalysis {
    pub year: i32,
    pub month: i32,
    pub weekday: i32,
    pub total_sales: f64,
    pub order_count: i32,
}

// === Таблица conversion_notes ===

#[derive(Queryable, Selectable, Identifiable, Associations, Debug, Clone)]
#[diesel(belongs_to(Conversion, foreign_key = conversion_date))]
#[diesel(table_name = crate::schema::conversion_notes)]
pub struct ConversionNote {
    pub id: i32,
    pub conversion_date: String,
    pub note: String,
    pub created_at: String,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::conversion_notes)]
pub struct NewConversionNote<'a> {
    pub conversion_date: &'a str,
    pub note: &'a str,
}

// === Таблица salary ===

#[derive(Queryable, Selectable, Identifiable, Associations, Debug, Clone)]
#[diesel(belongs_to(Staff, foreign_key = user_id))]
#[diesel(table_name = crate::schema::salary)]
pub struct Salary {
    pub id: i32,
    pub user_id: i32,
    pub month: String,
    pub base_salary: f64,
    pub bonus: f64,
    pub deductions: f64,
    pub total_salary: f64,
    pub created_at: String,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::salary)]
pub struct NewSalary {
    pub user_id: i32,
    pub month: String,
    pub base_salary: f64,
    pub bonus: f64,
    pub deductions: f64,
    pub total_salary: f64,
}

// === Таблица realized_positions ===

#[derive(Queryable, Selectable, Identifiable, Debug, Clone)]
#[diesel(table_name = crate::schema::realized_positions)]
pub struct RealizedPosition {
    pub id: i32,
    pub product_name: String,
    pub quantity: i32,
    pub total_amount: f64,
    pub month: String,
    pub created_at: String,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::realized_positions)]
pub struct NewRealizedPosition<'a> {
    pub product_name: &'a str,
    pub quantity: i32,
    pub total_amount: f64,
    pub month: &'a str,
}

// === Таблица position_counts ===

#[derive(Queryable, Selectable, Identifiable, Debug, Clone)]
#[diesel(table_name = crate::schema::position_counts)]
pub struct PositionCount {
    pub id: i32,
    pub product_name: String,
    pub quantity: i32,
    pub created_at: String,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::position_counts)]
pub struct NewPositionCount<'a> {
    pub product_name: &'a str,
    pub quantity: i32,
}

// === Таблица positions ===

#[derive(Queryable, Selectable, Identifiable, Debug, Clone, Serialize, Deserialize)]
#[diesel(table_name = crate::schema::positions)]
pub struct Position {
    pub id: i32,
    pub name: String,
    pub created_at: String,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::positions)]
pub struct NewPosition<'a> {
    pub name: &'a str,
}

// === Таблица staff ===

#[derive(Queryable, Selectable, Identifiable, Associations, Debug, Clone, Serialize, Deserialize)]
#[diesel(belongs_to(Position))]
#[diesel(table_name = crate::schema::staff)]
pub struct Staff {
    pub id: i32,
    pub full_name: String,
    pub position_id: i32,
    pub is_active: i32,
    pub created_at: String,
}

#[derive(Insertable)]
#[diesel(table_name = crate::schema::staff)]
pub struct NewStaff<'a> {
    pub full_name: &'a str,
    pub position_id: i32,
}