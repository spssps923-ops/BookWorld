// ==========================================
// BOOKWORLD — ПІДКЛЮЧЕННЯ SUPABASE
// ==========================================

// URL твого проєкту Supabase
const SUPABASE_URL = "https://ebowjqenhzzuhurflnoc.supabase.co";

// Публічний ключ Supabase
const SUPABASE_KEY = "sb_publishable_u-lm9E66Xpe49Vw2IgV0Pw_kkFJIvah";

// Створюємо підключення до Supabase
const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

// Робимо підключення доступним для інших файлів BookWorld
window.BookWorldSupabase = supabaseClient;