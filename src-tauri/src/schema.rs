diesel::table! {
    tasks (id) {
        id -> Nullable<Integer>,
        user_id -> Integer,
        date -> Text,
        description -> Text,
        completed -> Bool,
    }
}

diesel::table! {
    sales (id) {
        id -> Nullable<Integer>,
        datetime -> Text,
        product_name -> Text,
        recipe -> Nullable<Text>,
        total_amount -> Double,
        advance_amount -> Double,
        cash_amount -> Double,
        card_amount -> Double,
        sbp_amount -> Double,
        created_at -> Text,
    }
}

diesel::table! {
    daily_workers (id) {
        id -> Nullable<Integer>,
        date -> Text,
        worker_name -> Text,
        shift -> Nullable<Text>,
    }
}

diesel::table! {
    total_income (id) {
        id -> Nullable<Integer>,
        date -> Text,
        total_sum -> Double,
        created_at -> Text,
    }
}

diesel::table! {
    cash_register (id) {
        id -> Nullable<Integer>,
        date -> Text,
        morning_amount -> Double,
        evening_amount -> Double,
        created_at -> Text,
    }
}

diesel::table! {
    cash_operations (id) {
        id -> Nullable<Integer>,
        date -> Text,
        operation_type -> Text,
        amount -> Double,
        description -> Nullable<Text>,
        created_at -> Text,
    }
}

diesel::table! {
    schedule (id) {
        id -> Nullable<Integer>,
        user_id -> Integer,
        date -> Text,
        shift -> Text,
    }
}

diesel::table! {
    bonuses (id) {
        id -> Nullable<Integer>,
        user_id -> Integer,
        sale_id -> Nullable<Integer>,
        amount -> Double,
        date -> Text,
        created_at -> Text,
    }
}

diesel::table! {
    conversion (id) {
        id -> Nullable<Integer>,
        date -> Text,
        visitors_count -> Integer,
        sales_count -> Integer,
        orders_count -> Integer,
        diagnostics_count -> Integer,
        turnover -> Double,
        conversion_vs_last_year -> Nullable<Double>,
        conversion_vs_last_month -> Nullable<Double>,
        conversion_vs_last_week -> Nullable<Double>,
        created_at -> Text,
    }
}

diesel::table! {
    monthly_plan (id) {
        id -> Nullable<Integer>,
        year -> Integer,
        month -> Integer,
        orders_plan -> Double,
        turnover_plan -> Double,
        orders_actual -> Double,
        turnover_actual -> Double,
        daily_orders_plan -> Nullable<Double>,
        daily_orders_actual -> Double,
        daily_turnover_plan -> Nullable<Double>,
        daily_turnover_actual -> Double,
        remaining_orders -> Nullable<Double>,
        remaining_turnover -> Nullable<Double>,
        created_at -> Text,
    }
}

diesel::table! {
    weekday_analysis (id) {
        id -> Nullable<Integer>,
        year -> Integer,
        month -> Integer,
        weekday -> Integer,
        total_sales -> Double,
        order_count -> Integer,
        created_at -> Text,
    }
}

diesel::table! {
    conversion_notes (id) {
        id -> Nullable<Integer>,
        conversion_date -> Text,
        note -> Text,
        created_at -> Text,
    }
}

diesel::table! {
    salary (id) {
        id -> Nullable<Integer>,
        user_id -> Integer,
        month -> Text,
        base_salary -> Double,
        bonus -> Double,
        deductions -> Double,
        total_salary -> Double,
        created_at -> Text,
    }
}

diesel::table! {
    realized_positions (id) {
        id -> Nullable<Integer>,
        product_name -> Text,
        quantity -> Integer,
        total_amount -> Double,
        month -> Text,
        created_at -> Text,
    }
}

diesel::table! {
    position_counts (id) {
        id -> Nullable<Integer>,
        product_name -> Text,
        quantity -> Integer,
        created_at -> Text,
    }
}

diesel::table! {
    positions (id) {
        id -> Integer,
        name -> Text,
        created_at -> Text,
        norm_hours -> Nullable<Integer>,
        hours_per_shift -> Nullable<Double>,
        salary -> Nullable<Integer>,
        additional_payments -> Nullable<Double>,
    }
}

diesel::table! {
    staff (id) {
        id -> Integer,
        full_name -> Text,
        position_id -> Integer,
        is_active -> Integer,
        created_at -> Text,
    }
}

// Определение связей между таблицами
diesel::joinable!(staff -> positions (position_id));
diesel::joinable!(tasks -> staff (user_id));
diesel::joinable!(schedule -> staff (user_id));
diesel::joinable!(bonuses -> staff (user_id));
diesel::joinable!(salary -> staff (user_id));

diesel::allow_tables_to_appear_in_same_query!(
    positions,
    staff,
);