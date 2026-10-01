const SUPABASE_URL = "https://bxboffeqcsstrucrngih.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_h7G1sMOtWoHe_cDK5IwQzw_PBYq_6bh";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

const form = document.getElementById("auth-form");
const loginBox = document.querySelector(".login-box");
const dashboard = document.getElementById("dashboard");

const title = document.getElementById("form-title");
const subtitle = document.getElementById("form-subtitle");
const username = document.getElementById("username");
const fullname = document.getElementById("fullname");
const confirmBox = document.getElementById("confirm-box");
const password = document.getElementById("password");
const togglePassword = document.getElementById("toggle-password");
const switchMode = document.getElementById("switch-mode");
const switchText = document.getElementById("switch-text");
const submitBtn = document.getElementById("submit-btn");
const forgotBtn = document.getElementById("forgot-password");
const message = document.getElementById("message");
const welcomeName = document.getElementById("welcome-name");
const liveClock = document.getElementById("live-clock");
const logoutBtn = document.getElementById("logout-btn");

const spaceCard = document.getElementById("space-card");
const profilePopup = document.getElementById("profile-popup");
const closeProfile = document.getElementById("close-profile");

const learningCard = document.getElementById("learning-card");
const learningSection = document.getElementById("learning-section");
const closeLearning = document.getElementById("close-learning");

const storeSection = document.getElementById("store-section");
const shopCard = document.getElementById("shop-card");
const backDashboardBtn = document.getElementById("back-dashboard");
const productGrid = document.getElementById("product-grid");
const productSearch = document.getElementById("product-search");
const categoryButtons = document.querySelectorAll(".category-btn");
const cartBtn = document.getElementById("cart-btn");
const cartCount = document.getElementById("cart-count");
const cartSection = document.getElementById("cart-section");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const continueShoppingBtn = document.getElementById("continue-shopping");
const noProducts = document.getElementById("no-products");

let isSignup = false;
let currentUser = null;
let clockInterval;

function showMessage(text, type = "") {
    message.textContent = text;
    message.className = type;
}

function clearMessage() {
    showMessage("");
}

function updateClock() {
    if (liveClock) {
        liveClock.textContent = new Date().toLocaleTimeString();
    }
}

function startClock() {
    clearInterval(clockInterval);
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
}

function showDashboard(user) {
    currentUser = user;

    if (learningSection) learningSection.hidden = true;
    if (profilePopup) profilePopup.hidden = true;
    if (storeSection) storeSection.hidden = true;
    if (cartSection) cartSection.hidden = true;

    const name =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "User";

    welcomeName.textContent = name;
    loginBox.hidden = true;
    dashboard.hidden = false;

    startClock();
}

function showLogin() {
    clearInterval(clockInterval);
    dashboard.hidden = true;
    loginBox.hidden = false;
}

function setLoading(loading) {
    submitBtn.disabled = loading;
    submitBtn.textContent = loading
        ? "PLEASE WAIT..."
        : isSignup
            ? "SIGN UP"
            : "LOGIN";
}

switchMode.addEventListener("click", () => {
    isSignup = !isSignup;
    form.reset();
    clearMessage();

    title.textContent = isSignup ? "Create Account" : "Welcome Back";
    subtitle.textContent = isSignup
        ? "Join us and start your journey"
        : "Login to continue your journey";

    confirmBox.hidden = !isSignup;
    fullname.required = isSignup;

    password.autocomplete = isSignup
        ? "new-password"
        : "current-password";

    submitBtn.textContent = isSignup ? "SIGN UP" : "LOGIN";

    switchText.firstChild.textContent = isSignup
        ? "Already have an account? "
        : "Don't have an account? ";

    switchMode.textContent = isSignup ? "Login" : "Sign up";
    forgotBtn.hidden = isSignup;
});

togglePassword.addEventListener("click", () => {
    const showing = password.type === "text";
    password.type = showing ? "password" : "text";
    togglePassword.textContent = showing ? "Show" : "Hide";
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearMessage();

    const email = username.value.trim().toLowerCase();
    const pass = password.value;

    if (pass.length < 6) {
        showMessage(
            "Password must contain at least 6 characters.",
            "error"
        );
        return;
    }

    if (isSignup && !fullname.value.trim()) {
        showMessage("Please enter your full name.", "error");
        return;
    }

    setLoading(true);

    try {
        if (isSignup) {
            const { data, error } = await supabaseClient.auth.signUp({
                email,
                password: pass,
                options: {
                    data: {
                        full_name: fullname.value.trim()
                    }
                }
            });

            if (error) throw error;

            if (data.session) {
                showDashboard(data.user);
                form.reset();
            } else {
                showMessage(
                    "Account created! Check your email to confirm your account, then log in.",
                    "success"
                );

                isSignup = false;
                title.textContent = "Welcome Back";
                subtitle.textContent = "Login to continue your journey";
                confirmBox.hidden = true;
                fullname.required = false;
                submitBtn.textContent = "LOGIN";
                switchText.firstChild.textContent = "Don't have an account? ";
                switchMode.textContent = "Sign up";
                forgotBtn.hidden = false;
                password.value = "";
            }
        } else {
            const { data, error } =
                await supabaseClient.auth.signInWithPassword({
                    email,
                    password: pass
                });

            if (error) throw error;

            showDashboard(data.user);
            form.reset();
        }
    } catch (error) {
        showMessage(error.message, "error");
    } finally {
        setLoading(false);
    }
});
// Forgot password
forgotBtn.addEventListener("click", async () => {
    const email = username.value.trim().toLowerCase();

    if (!email) {
        showMessage("Enter your email address first.", "error");
        username.focus();
        return;
    }

    try {
        const { error } =
            await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin
            });

        if (error) throw error;

        showMessage(
            "If an account exists for that email, a reset link will be sent. Check your inbox.",
            "success"
        );
    } catch (error) {
        showMessage(error.message, "error");
    }
});

// Logout
logoutBtn.addEventListener("click", async () => {
    logoutBtn.disabled = true;

    try {
        const { error } = await supabaseClient.auth.signOut();
        if (error) throw error;

        showLogin();
        form.reset();
        clearMessage();
    } catch (error) {
        showMessage(error.message, "error");
    } finally {
        logoutBtn.disabled = false;
    }
});

// Restore existing session
async function restoreSession() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        showMessage(
            "Could not restore your session. Please log in.",
            "error"
        );
        return;
    }

    if (data.session) {
        showDashboard(data.session.user);
    }
}

restoreSession();

// Password recovery
supabaseClient.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
        setTimeout(async () => {
            const newPassword = prompt(
                "Enter your new password (at least 6 characters):"
            );

            if (!newPassword || newPassword.length < 6) {
                showMessage(
                    "Password must contain at least 6 characters.",
                    "error"
                );
                return;
            }

            const { error } = await supabaseClient.auth.updateUser({
                password: newPassword
            });

            if (error) {
                showMessage(error.message, "error");
            } else {
                showMessage(
                    "Password updated successfully. You can log in.",
                    "success"
                );
            }
        }, 0);
    }
});

// Profile popup
function openProfile() {
    const user = currentUser;

    if (user) {
        document.getElementById("profile-name").textContent =
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "User";

        document.getElementById("profile-email").textContent =
            user.email || "";
    }

    profilePopup.hidden = false;
}

if (spaceCard) {
    spaceCard.addEventListener("click", openProfile);

    spaceCard.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openProfile();
        }
    });
}

if (closeProfile) {
    closeProfile.addEventListener("click", () => {
        profilePopup.hidden = true;
    });
}

// Learning Hub
function openLearningHub() {
    dashboard.hidden = true;
    profilePopup.hidden = true;
    storeSection.hidden = true;
    learningSection.hidden = false;
}

if (learningCard) {
    learningCard.addEventListener("click", openLearningHub);

    learningCard.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openLearningHub();
        }
    });
}

if (closeLearning) {
    closeLearning.addEventListener("click", () => {
        learningSection.hidden = true;
        dashboard.hidden = false;
        loginBox.hidden = true;
    });
}
// ShopEase product catalogue
const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        category: "Electronics",
        price: 1499,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        name: "Smart Watch",
        category: "Electronics",
        price: 1999,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        name: "Bluetooth Speaker",
        category: "Electronics",
        price: 999,
        image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        name: "Classic T-Shirt",
        category: "Fashion",
        price: 499,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 5,
        name: "Casual Sneakers",
        category: "Fashion",
        price: 1799,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 6,
        name: "Travel Backpack",
        category: "Fashion",
        price: 899,
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 7,
        name: "Desk Lamp",
        category: "Home",
        price: 699,
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 8,
        name: "Coffee Mug",
        category: "Home",
        price: 249,
        image: "https://images.unsplash.com/photo-1514228742587-6b1558f9593e?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 9,
        name: "Cushion Set",
        category: "Home",
        price: 599,
        image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 10,
        name: "Sunglasses",
        category: "Accessories",
        price: 399,
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 11,
        name: "Wrist Watch",
        category: "Accessories",
        price: 1299,
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 12,
        name: "Water Bottle",
        category: "Accessories",
        price: 299,
        image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80"
    }
];

let selectedCategory = "All";
let shoppingCart = [];

// Display products
function renderProducts() {
    if (!productGrid || !productSearch || !noProducts) return;

    const searchText = productSearch.value.trim().toLowerCase();

    const filteredProducts = products.filter((product) => {
        const matchesCategory =
            selectedCategory === "All" ||
            product.category === selectedCategory;

        const matchesSearch =
            product.name.toLowerCase().includes(searchText) ||
            product.category.toLowerCase().includes(searchText);

        return matchesCategory && matchesSearch;
    });

    productGrid.innerHTML = "";
    noProducts.hidden = filteredProducts.length > 0;

    filteredProducts.forEach((product) => {
        const card = document.createElement("article");
        card.className = "product-card";

        const image = document.createElement("img");
        image.src = product.image;
        image.alt = product.name;
        image.loading = "lazy";

        image.onerror = () => {
            image.style.display = "none";
        };

        const info = document.createElement("div");
        info.className = "product-info";

        const name = document.createElement("h3");
        name.textContent = product.name;

        const category = document.createElement("p");
        category.className = "product-category";
        category.textContent = product.category;

        const price = document.createElement("p");
        price.className = "product-price";
        price.textContent =
            "₹" + product.price.toLocaleString("en-IN");

        const existingItem = shoppingCart.find(
            (item) => item.id === product.id
        );

        if (existingItem) {
            const controls = document.createElement("div");
            controls.className = "quantity-controls";

            const minus = document.createElement("button");
            minus.type = "button";
            minus.textContent = "−";

            minus.addEventListener("click", () => {
                changeQuantity(product.id, -1);
            });

            const quantity = document.createElement("span");
            quantity.className = "product-quantity";
            quantity.textContent = existingItem.quantity;

            const plus = document.createElement("button");
            plus.type = "button";
            plus.textContent = "+";

            plus.addEventListener("click", () => {
                changeQuantity(product.id, 1);
            });

            controls.append(minus, quantity, plus);
            info.append(name, category, price, controls);
        } else {
            const addButton = document.createElement("button");
            addButton.className = "add-cart-btn";
            addButton.type = "button";
            addButton.textContent = "Add to Cart";

            addButton.addEventListener("click", () => {
                addToCart(product.id);
            });

            info.append(name, category, price, addButton);
        }

        card.append(image, info);
        productGrid.appendChild(card);
    });
}// Add product to cart
function addToCart(productId) {
    const product = products.find(
        (item) => item.id === productId
    );

    if (!product) return;

    const existingItem = shoppingCart.find(
        (item) => item.id === productId
    );

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        shoppingCart.push({
            ...product,
            quantity: 1
        });
    }

    renderCart();
    renderProducts();
}

// Increase or decrease quantity
function changeQuantity(productId, change) {
    const item = shoppingCart.find(
        (product) => product.id === productId
    );

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        shoppingCart = shoppingCart.filter(
            (product) => product.id !== productId
        );
    }

    renderCart();
    renderProducts();
}

// Display cart items and total
function renderCart() {
    if (!cartItems || !cartCount || !cartTotal) return;

    cartItems.innerHTML = "";

    const totalQuantity = shoppingCart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const totalPrice = shoppingCart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    cartCount.textContent = totalQuantity;

    cartTotal.textContent =
        "Total: ₹" + totalPrice.toLocaleString("en-IN");

    shoppingCart.forEach((item) => {
        const row = document.createElement("div");
        row.className = "cart-item";

        const details = document.createElement("span");

        details.textContent =
            `${item.name} × ${item.quantity} — ₹${(
                item.price * item.quantity
            ).toLocaleString("en-IN")}`;

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", () => {
            shoppingCart = shoppingCart.filter(
                (product) => product.id !== item.id
            );

            renderCart();
            renderProducts();
        });

        row.append(details, removeButton);
        cartItems.appendChild(row);
    });
}

// Category filters
categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
        selectedCategory = button.dataset.category;

        categoryButtons.forEach((categoryButton) => {
            categoryButton.classList.toggle(
                "active",
                categoryButton === button
            );
        });

        renderProducts();
    });
});

// Product search
if (productSearch) {
    productSearch.addEventListener("input", renderProducts);
}

// Open cart
if (cartBtn) {
    cartBtn.addEventListener("click", () => {
        if (shoppingCart.length === 0) {
            alert("Your cart is empty. Add some products first.");
            return;
        }

        cartSection.hidden = false;

        cartSection.scrollIntoView({
            behavior: "smooth"
        });
    });
}

// Continue shopping
if (continueShoppingBtn) {
    continueShoppingBtn.addEventListener("click", () => {
        cartSection.hidden = true;

        productGrid.scrollIntoView({
            behavior: "smooth"
        });
    });
}

// Back to dashboard
if (backDashboardBtn) {
    backDashboardBtn.addEventListener("click", () => {
        storeSection.hidden = true;
        cartSection.hidden = true;
        dashboard.hidden = false;
    });
}

// Demo checkout
if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
        if (shoppingCart.length === 0) {
            alert("Your cart is empty. Add some products first.");
            return;
        }

        alert(
            "Your cart is ready! Online checkout is not connected yet."
        );
    });
}

// Open ShopEase
function openStore() {
    dashboard.hidden = true;
    profilePopup.hidden = true;
    learningSection.hidden = true;
    storeSection.hidden = false;
    cartSection.hidden = true;

    renderProducts();
    renderCart();
}

if (shopCard) {
    shopCard.addEventListener("click", openStore);

    shopCard.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openStore();
        }
    });
}

// Initial render
renderProducts();
renderCart();