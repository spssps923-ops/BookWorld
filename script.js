// ==========================================
// BOOKWORLD — ГОЛОВНА СИСТЕМА
// ==========================================

// Підключення Supabase
const db = window.BookWorldSupabase;

// Головний об'єкт BookWorld
window.BookWorld = window.BookWorld || {};


// ==========================================
// СПЛИВАЮЧІ ПОВІДОМЛЕННЯ
// ==========================================

window.BookWorld.showToast =
function(message, type = "success") {

    const oldToast =
        document.querySelector(".bw-toast");

    if (oldToast) {
        oldToast.remove();
    }


    const icons = {
        success: "✓",
        error: "✕",
        warning: "!",
        info: "i"
    };


    const toast =
        document.createElement("div");


    toast.className =
        "bw-toast " + type;


    toast.innerHTML =
        '<div class="bw-toast-icon">' +
            (icons[type] || "i") +
        '</div>' +

        '<div class="bw-toast-content">' +
            message +
        '</div>';


    document.body.appendChild(toast);


    setTimeout(function() {

        toast.classList.add("hide");


        setTimeout(function() {

            if (toast) {
                toast.remove();
            }

        }, 300);

    }, 3000);

};


// ==========================================
// ПІДТВЕРДЖЕННЯ
// ==========================================

window.BookWorld.showConfirm =
function(
    message,
    title = "Підтвердження"
) {

    return new Promise(function(resolve) {

        const overlay =
            document.createElement("div");


        overlay.className =
            "bw-popup-overlay";


        overlay.innerHTML =

            '<div class="bw-popup">' +

                '<div class="bw-popup-icon">?</div>' +

                '<h2>' +
                    title +
                '</h2>' +

                '<p>' +
                    message +
                '</p>' +

                '<div class="bw-popup-buttons">' +

                    '<button class="bw-btn cancel" type="button">' +
                        'Скасувати' +
                    '</button>' +

                    '<button class="bw-btn confirm" type="button">' +
                        'Підтвердити' +
                    '</button>' +

                '</div>' +

            '</div>';


        document.body.appendChild(overlay);


        const cancelButton =
            overlay.querySelector(".cancel");


        const confirmButton =
            overlay.querySelector(".confirm");


        cancelButton.addEventListener(
            "click",
            function() {

                overlay.remove();

                resolve(false);

            }
        );


        confirmButton.addEventListener(
            "click",
            function() {

                overlay.remove();

                resolve(true);

            }
        );

    });

};


// ==========================================
// ВВЕДЕННЯ
// ==========================================

window.BookWorld.showPrompt =
function(
    title = "Введіть значення",
    placeholder = ""
) {

    return new Promise(function(resolve) {

        const overlay =
            document.createElement("div");


        overlay.className =
            "bw-popup-overlay";


        overlay.innerHTML =

            '<div class="bw-popup">' +

                '<div class="bw-popup-icon">🔐</div>' +

                '<h2>' +
                    title +
                '</h2>' +

                '<input ' +
                    'type="password" ' +
                    'class="bw-popup-input" ' +
                    'placeholder="' +
                    placeholder +
                '">' +

                '<div class="bw-popup-buttons">' +

                    '<button class="bw-btn cancel" type="button">' +
                        'Скасувати' +
                    '</button>' +

                    '<button class="bw-btn confirm" type="button">' +
                        'Підтвердити' +
                    '</button>' +

                '</div>' +

            '</div>';


        document.body.appendChild(overlay);


        const input =
            overlay.querySelector(
                ".bw-popup-input"
            );


        const cancelButton =
            overlay.querySelector(".cancel");


        const confirmButton =
            overlay.querySelector(".confirm");


        function close(value) {

            overlay.remove();

            resolve(value);

        }


        cancelButton.addEventListener(
            "click",
            function() {

                close(null);

            }
        );


        confirmButton.addEventListener(
            "click",
            function() {

                close(input.value);

            }
        );


        input.addEventListener(
            "keydown",
            function(event) {

                if (event.key === "Enter") {
                    close(input.value);
                }


                if (event.key === "Escape") {
                    close(null);
                }

            }
        );


        setTimeout(function() {

            input.focus();

        }, 50);

    });

};


// ==========================================
// ПОТОЧНИЙ КОРИСТУВАЧ
// ==========================================

window.BookWorld.getCurrentUser =
async function() {

    if (!db) {
        return null;
    }


    try {

        const result =
            await db.auth.getUser();


        if (result.error) {

            console.error(
                result.error
            );

            return null;

        }


        return result.data.user || null;

    }

    catch (error) {

        console.error(error);

        return null;

    }

};


// ==========================================
// АДМІН-ПАНЕЛЬ
// ==========================================

window.BookWorld.openAdmin =
async function() {

    const user =
        await window.BookWorld.getCurrentUser();


    if (!user) {

        window.BookWorld.showToast(
            "Спочатку увійдіть в акаунт.",
            "warning"
        );


        window.location.href =
            "login.html";

        return;

    }


    const result =
        await db
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();


    if (result.error) {

        console.error(
            result.error
        );


        window.BookWorld.showToast(
            "Не вдалося перевірити права доступу.",
            "error"
        );

        return;

    }


    if (
        result.data &&
        result.data.role === "admin"
    ) {

        window.location.href =
            "admin.html";

    }

    else {

        window.BookWorld.showToast(
            "У вас немає доступу до адмінки.",
            "error"
        );

    }

};


// ==========================================
// UUID КНИГИ
// ==========================================

window.BookWorld.getBookUUID =
async function(bookCode) {

    if (!db) {
        return null;
    }


    const result =
        await db
            .from("books")
            .select("id")
            .eq("book_code", bookCode)
            .eq("is_deleted", false)
            .maybeSingle();


    if (result.error) {

        console.error(
            "Помилка пошуку книги:",
            result.error
        );

        return null;

    }


    return result.data
        ? result.data.id
        : null;

};


// ==========================================
// ОТРИМАННЯ КОШИКА
// ==========================================

window.BookWorld.getCartItems =
async function() {

    const user =
        await window.BookWorld.getCurrentUser();


    if (!user) {
        return [];
    }


    const result =
        await db
            .from("cart_items")
            .select(
                "id, user_id, book_id, quantity, books(*)"
            )
            .eq("user_id", user.id);


    if (result.error) {

        console.error(
            "Помилка завантаження кошика:",
            result.error
        );

        return [];

    }


    return (result.data || [])
        .filter(function(item) {

            return (
                item.books &&
                item.books.is_deleted !== true
            );

        });

};


// ==========================================
// КОШИК
// ==========================================

window.BookWorld.getCart =
async function() {

    const items =
        await window.BookWorld.getCartItems();


    const cart = {};


    items.forEach(function(item) {

        if (
            item.books &&
            item.books.book_code
        ) {

            cart[item.books.book_code] =
                Number(item.quantity) || 0;

        }

    });


    return cart;

};


// ==========================================
// ДОДАТИ ДО КОШИКА
// ==========================================

window.BookWorld.addToCart =
async function(bookCode) {

    try {

        const user =
            await window.BookWorld.getCurrentUser();


        if (!user) {

            window.BookWorld.showToast(
                "Спочатку увійдіть в акаунт.",
                "warning"
            );


            window.location.href =
                "login.html";


            return false;

        }


        const bookUUID =
            await window.BookWorld.getBookUUID(
                bookCode
            );


        if (!bookUUID) {

            window.BookWorld.showToast(
                "Книгу не знайдено.",
                "error"
            );

            return false;

        }


        const existingResult =
            await db
                .from("cart_items")
                .select("id, quantity")
                .eq("user_id", user.id)
                .eq("book_id", bookUUID)
                .maybeSingle();


        if (existingResult.error) {

            console.error(
                existingResult.error
            );


            window.BookWorld.showToast(
                "Не вдалося перевірити кошик.",
                "error"
            );


            return false;

        }


        // Якщо книга вже є у кошику —
        // збільшуємо кількість
        if (existingResult.data) {

            const updateResult =
                await db
                    .from("cart_items")
                    .update({
                        quantity:
                            Number(
                                existingResult.data.quantity
                            ) + 1
                    })
                    .eq(
                        "id",
                        existingResult.data.id
                    )
                    .eq(
                        "user_id",
                        user.id
                    );


            if (updateResult.error) {

                console.error(
                    updateResult.error
                );

                return false;

            }

        }

        // Якщо книги ще немає —
        // створюємо новий запис
        else {

            const insertResult =
                await db
                    .from("cart_items")
                    .insert({
                        user_id: user.id,
                        book_id: bookUUID,
                        quantity: 1
                    });


            if (insertResult.error) {

                console.error(
                    insertResult.error
                );

                return false;

            }

        }


        window.BookWorld.showToast(
            "Книгу додано до кошика! 🛒",
            "success"
        );


        return true;

    }

    catch (error) {

        console.error(error);


        window.BookWorld.showToast(
            "Сталася помилка.",
            "error"
        );


        return false;

    }

};


// ==========================================
// ПРИБРАТИ З КОШИКА
// ==========================================

window.BookWorld.removeFromCart =
async function(bookCode) {

    try {

        const user =
            await window.BookWorld.getCurrentUser();


        if (!user) {
            return false;
        }


        const bookUUID =
            await window.BookWorld.getBookUUID(
                bookCode
            );


        if (!bookUUID) {
            return false;
        }


        const result =
            await db
                .from("cart_items")
                .select("id, quantity")
                .eq("user_id", user.id)
                .eq("book_id", bookUUID)
                .maybeSingle();


        if (result.error) {

            console.error(
                result.error
            );

            return false;

        }


        if (!result.data) {

            window.BookWorld.showToast(
                "Цієї книги немає у кошику.",
                "warning"
            );

            return false;

        }


        const newQuantity =
            Number(result.data.quantity) - 1;


        // Якщо залишилася нульова кількість —
        // видаляємо запис
        if (newQuantity <= 0) {

            const deleteResult =
                await db
                    .from("cart_items")
                    .delete()
                    .eq(
                        "id",
                        result.data.id
                    )
                    .eq(
                        "user_id",
                        user.id
                    );


            if (deleteResult.error) {

                console.error(
                    deleteResult.error
                );

                return false;

            }

        }

        // Інакше просто зменшуємо кількість
        else {

            const updateResult =
                await db
                    .from("cart_items")
                    .update({
                        quantity: newQuantity
                    })
                    .eq(
                        "id",
                        result.data.id
                    )
                    .eq(
                        "user_id",
                        user.id
                    );


            if (updateResult.error) {

                console.error(
                    updateResult.error
                );

                return false;

            }

        }


        window.BookWorld.showToast(
            "Книгу прибрано з кошика.",
            "info"
        );


        return true;

    }

    catch (error) {

        console.error(error);

        return false;

    }

};


// ==========================================
// ОЧИСТИТИ КОШИК
// ==========================================

window.BookWorld.clearCart =
async function() {

    const user =
        await window.BookWorld.getCurrentUser();


    if (!user) {
        return false;
    }


    const result =
        await db
            .from("cart_items")
            .delete()
            .eq(
                "user_id",
                user.id
            );


    if (result.error) {

        console.error(
            result.error
        );


        window.BookWorld.showToast(
            "Не вдалося очистити кошик.",
            "error"
        );


        return false;

    }


    window.BookWorld.showToast(
        "Кошик очищено.",
        "info"
    );


    return true;

};


// ==========================================
// КІЛЬКІСТЬ КНИГ
// ==========================================

window.BookWorld.getCartCount =
async function() {

    const items =
        await window.BookWorld.getCartItems();


    let count = 0;


    items.forEach(function(item) {

        count +=
            Number(item.quantity) || 0;

    });


    return count;

};


// ==========================================
// ОНОВЛЕННЯ ПОСИЛАНЬ КОШИКА
// ==========================================

window.BookWorld.updateCartLinks =
function() {

    const links =
        document.querySelectorAll(
            'a[href="cart.html"], #cart-link'
        );


    links.forEach(function(link) {

        link.href =
            "cart.html";

    });

};


// ==========================================
// СТАРИЙ ФОРМАТ URL КОШИКА
// ==========================================

window.BookWorld.parseCartUrl =
function(value) {

    const result = {};


    if (!value) {
        return result;
    }


    value.split("|")
        .forEach(function(item) {

            const parts =
                item.split(":");


            if (parts.length !== 2) {
                return;
            }


            const id =
                parts[0];


            const quantity =
                Number(parts[1]);


            if (
                id &&
                Number.isFinite(quantity) &&
                quantity > 0
            ) {

                result[id] =
                    Math.floor(quantity);

            }

        });


    return result;

};


// ==========================================
// ГЛОБАЛЬНІ ФУНКЦІЇ
// ==========================================

window.showToast =
    window.BookWorld.showToast;

window.showConfirm =
    window.BookWorld.showConfirm;

window.showPrompt =
    window.BookWorld.showPrompt;

window.openAdmin =
    window.BookWorld.openAdmin;


// ==========================================
// ЗАПУСК
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        // Оновлюємо посилання кошика
        window.BookWorld.updateCartLinks();

    }
);