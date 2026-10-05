// ==========================================
// 1. SUPABASE CONFIGURATION
// ==========================================
const SUPABASE_URL = "https://bxboffeqcsstrucrngih.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Ym9mZmVxY3NzdHJ1Y3JuZ2loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA4NzcwMDIsImV4cCI6MjEwNjQ1MzAwMn0.Z6ehGSqfASaybKUU8gh1GTEiFLvcqTYrqtBjCh3tc6k";
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// ==========================================
// 2. DOM ELEMENTS
// ==========================================
const authForm = document.getElementById("auth-form");
const loginBox = document.querySelector(".login-box");
const dashboard = document.getElementById("dashboard");
const usernameInput = document.getElementById("username");
const fullnameInput = document.getElementById("fullname");
const passwordInput = document.getElementById("password");
const confirmBox = document.getElementById("confirm-box");
const submitBtn = document.getElementById("submit-btn");
const switchModeBtn = document.getElementById("switch-mode");
const switchText = document.getElementById("switch-text");
const formTitle = document.getElementById("form-title");
const formSubtitle = document.getElementById("form-subtitle");
const message = document.getElementById("message");
const togglePassBtn = document.getElementById("toggle-password");
const welcomeName = document.getElementById("welcome-name");
const logoutBtn = document.getElementById("logout-btn");
const liveClock = document.getElementById("live-clock");

// Section containers
const profilePopup = document.getElementById("profile-popup");
const learningSection = document.getElementById("learning-section");
const creativeSection = document.getElementById("creative-section");
const storeSection = document.getElementById("store-section");

// Dashboard feature buttons
const spaceCard = document.getElementById("space-card");
const learningCard = document.getElementById("learning-card");
const shopCard = document.getElementById("shop-card");
const creativeCard = document.getElementById("creative-card");
const geminiCard = document.getElementById("gemini-card");

let isSignup = false;
let currentUser = null;

// ==========================================
// 3. UI TOGGLES & HELPERS
// ==========================================
function showMessage(msg, type = "info") {
    if (!message) return;
    message.textContent = msg;
    message.className = type;
}

if (togglePassBtn && passwordInput) {
    togglePassBtn.addEventListener("click", () => {
        const isPassword = passwordInput.type === "password";
        passwordInput.type = isPassword ? "text" : "password";
        togglePassBtn.textContent = isPassword ? "Hide" : "Show";
    });
}

if (switchModeBtn) {
    switchModeBtn.addEventListener("click", () => {
        isSignup = !isSignup;
        if (confirmBox) confirmBox.hidden = !isSignup;
        if (fullnameInput) fullnameInput.required = isSignup;
        if (formTitle) formTitle.textContent = isSignup ? "Create Account" : "Welcome Back";
        if (formSubtitle) formSubtitle.textContent = isSignup ? "Join our creative platform today" : "Login to continue your journey";
        if (submitBtn) submitBtn.textContent = isSignup ? "SIGN UP" : "LOGIN";
        if (switchText && switchText.firstChild) {
            switchText.firstChild.textContent = isSignup ? "Already have an account? " : "Don't have an account? ";
        }
        switchModeBtn.textContent = isSignup ? "Login" : "Sign up";
        showMessage("");
    });
}

function showDashboard(user) {
    currentUser = user;
    if (loginBox) loginBox.hidden = true;
    if (dashboard) dashboard.hidden = false;
    const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Friend";
    if (welcomeName) welcomeName.textContent = name;
    const profileName = document.getElementById("profile-name");
    const profileEmail = document.getElementById("profile-email");
    if (profileName) profileName.textContent = name;
    if (profileEmail) profileEmail.textContent = user?.email || "";
}

// ==========================================
// 4. AUTHENTICATION & AUTO-LOGIN
// ==========================================
if (authForm && supabaseClient) {
    authForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = usernameInput.value.trim();
        const password = passwordInput.value;

        try {
            if (isSignup) {
                const { data, error } = await supabaseClient.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullnameInput ? fullnameInput.value.trim() : ""
                        }
                    }
                });

                if (error) throw error;

                if (data.session) {
                    showDashboard(data.user);
                } else {
                    const loginRes = await supabaseClient.auth.signInWithPassword({
                        email,
                        password
                    });
                    if (loginRes.data?.user) {
                        showDashboard(loginRes.data.user);
                    } else if (data.user) {
                        showDashboard(data.user);
                    }
                }
                authForm.reset();
            } else {
                const { data, error } = await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
                showDashboard(data.user);
                authForm.reset();
            }
        } catch (err) {
            showMessage(err.message, "error");
        }
    });
}

if (logoutBtn && supabaseClient) {
    logoutBtn.addEventListener("click", async () => {
        await supabaseClient.auth.signOut();
        currentUser = null;
        if (dashboard) dashboard.hidden = true;
        if (loginBox) loginBox.hidden = false;
        showMessage("Logged out successfully.", "success");
    });
}

// Live Clock
function updateClock() {
    if (!liveClock) return;
    const now = new Date();
    liveClock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

// ==========================================
// 5. VIEW NAVIGATION
// ==========================================
function hideAllSections() {
    if (profilePopup) profilePopup.hidden = true;
    if (learningSection) learningSection.hidden = true;
    if (creativeSection) creativeSection.hidden = true;
    if (storeSection) storeSection.hidden = true;
    if (dashboard) dashboard.hidden = false;
}

if (spaceCard) spaceCard.addEventListener("click", () => {
    if (profilePopup) profilePopup.hidden = false;
});
const closeProfile = document.getElementById("close-profile");
if (closeProfile) closeProfile.addEventListener("click", () => {
    if (profilePopup) profilePopup.hidden = true;
});

if (learningCard) learningCard.addEventListener("click", () => {
    if (dashboard) dashboard.hidden = true;
    if (learningSection) learningSection.hidden = false;
});
const closeLearning = document.getElementById("close-learning");
if (closeLearning) closeLearning.addEventListener("click", hideAllSections);

if (creativeCard) creativeCard.addEventListener("click", () => {
    if (dashboard) dashboard.hidden = true;
    if (creativeSection) creativeSection.hidden = false;
});
const backCreative = document.getElementById("back-creative");
if (backCreative) backCreative.addEventListener("click", hideAllSections);

if (shopCard) shopCard.addEventListener("click", () => {
    if (dashboard) dashboard.hidden = true;
    if (storeSection) storeSection.hidden = false;
});
const backDashboard = document.getElementById("back-dashboard");
if (backDashboard) backDashboard.addEventListener("click", hideAllSections);

// ==========================================
// 6. CREATIVE IDEA GENERATOR
// ==========================================
const generateIdeaBtn = document.getElementById("generate-idea");
const ideaInterest = document.getElementById("idea-interest");
const ideaType = document.getElementById("idea-type");
const ideaResult = document.getElementById("idea-result");

if (generateIdeaBtn && ideaResult) {
    generateIdeaBtn.addEventListener("click", () => {
        const domain = (ideaInterest?.value || "").trim() || "Technology & Logistics";
        const type = (ideaType?.value || "Project").toUpperCase();

        const ideaBank = [
            {
                title: `AI Autonomous Analytics Engine for ${domain}`,
                desc: `A cloud microservice that processes telemetry and historical datasets to predict bottlenecks, anomalies, and operational inefficiencies across ${domain}.`
            },
            {
                title: `Decentralized Resource Exchange for ${domain}`,
                desc: `A verified peer-to-peer web platform enabling real-time collaboration, asset pooling, and transparent workflows tailored for ${domain}.`
            },
            {
                title: `Intelligent Dynamic Scheduler for ${domain}`,
                desc: `A responsive planning module that leverages graph traversal and priority queues to automate scheduling, production cycles, and resource allocation.`
            },
            {
                title: `Smart IoT Monitoring Companion for ${domain}`,
                desc: `An edge-interfacing sensor network and live control dashboard with alert streaming and diagnostic telemetry customized for ${domain}.`
            },
            {
                title: `Interactive Skill & Concept Sandbox for ${domain}`,
                desc: `A hands-on simulator featuring modular challenges, guided problem solving, and instant algorithmic benchmarking for learners in ${domain}.`
            }
        ];

        const selectedIdeas = [...ideaBank].sort(() => 0.5 - Math.random()).slice(0, 4);

        ideaResult.innerHTML = `
            <div style="margin-top: 16px; text-align: left; animation: fadeIn 0.3s ease;">
                <h4 style="color: #00f0ff; margin-bottom: 12px; font-size: 1rem; letter-spacing: 0.5px;">
                    💡 Top Generated ${type} Ideas for <span style="color:#fff;">"${domain}"</span>:
                </h4>
                <div style="display: grid; gap: 10px;">
                    ${selectedIdeas.map((item, index) => `
                        <div style="background: rgba(255,255,255,0.04); border-left: 3px solid #00f0ff; padding: 12px 14px; border-radius: 6px;">
                            <div style="font-weight: 600; color: #fff; font-size: 0.95rem; margin-bottom: 3px;">
                                ${index + 1}.${item.title}
                            </div>
                            <div style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.4;">
                                ${item.desc}
                            </div>
                        </div>
                    `).join("")}
                </div>
            </div>
        `;
    });
}

// ==========================================
// 7. SHOPEASE STORE LOGIC
// ==========================================
const products = [
    { 
        id: 1, 
        name: "Neon Cyberpunk Headphones", 
        category: "Electronics", 
        price: 2999, 
        rating: "4.8 ★",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80" 
    },
    { 
        id: 2, 
        name: "Mechanical RGB Keyboard", 
        category: "Electronics", 
        price: 4499, 
        rating: "4.9 ★",
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80" 
    },
    { 
        id: 3, 
        name: "Curved Ultra-Wide Gaming Monitor", 
        category: "Electronics", 
        price: 15999, 
        rating: "4.9 ★",
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80" 
    },
    { 
        id: 4, 
        name: "Oversized Minimalist Hoodie", 
        category: "Fashion", 
        price: 1799, 
        rating: "4.7 ★",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80" 
    },
    { 
        id: 5, 
        name: "Vintage Urban Denim Jacket", 
        category: "Fashion", 
        price: 2499, 
        rating: "4.6 ★",
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&q=80" 
    },
    { 
        id: 6, 
        name: "Smart Ambient LED Lamp", 
        category: "Home", 
        price: 1299, 
        rating: "4.6 ★",
        image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80" 
    },
    { 
        id: 7, 
        name: "Ultrasonic Aroma Diffuser", 
        category: "Home", 
        price: 1599, 
        rating: "4.7 ★",
        image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=500&q=80" 
    },
    { 
        id: 8, 
        name: "Matte Black Metal Tumbler", 
        category: "Accessories", 
        price: 799, 
        rating: "4.5 ★",
        image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=500&q=80" 
    },
    { 
        id: 9, 
        name: "Minimalist Leather Backpack", 
        category: "Accessories", 
        price: 3199, 
        rating: "4.8 ★",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80" 
    }
];

let cart = [];
const productGrid = document.getElementById("product-grid");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const cartBtn = document.getElementById("cart-btn");
const cartSection = document.getElementById("cart-section");
const continueShopping = document.getElementById("continue-shopping");

function renderProducts(items) {
    if (!productGrid) return;
    productGrid.innerHTML = items.map(p => `
        <div class="product-card" style="border: 1px solid rgba(0, 240, 255, 0.25); border-radius: 10px; overflow: hidden; background: #0f172a; display: flex; flex-direction: column; box-shadow: 0 4px 12px rgba(0,0,0,0.3); margin-bottom: 12px;">
            <div style="width: 100%; height: 160px; overflow: hidden; background: #020617;">
                <img src="${p.image}" alt="${p.name}" style="width: 100%; height: 100%; object-fit: cover;" />
            </div>
            <div style="padding: 14px; display: flex; flex-direction: column; flex-grow: 1; justify-content: space-between;">
                <div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                        <span style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.5px; color: #00f0ff; background: rgba(0, 240, 255, 0.1); padding: 2px 6px; border-radius: 4px;">${p.category}</span>
                        <span style="font-size: 0.78rem; color: #f59e0b; font-weight: bold;">${p.rating}</span>
                    </div>
                    <h4 style="color: #fff; font-size: 0.98rem; margin: 4px 0 8px 0; font-weight: 600; line-height: 1.3;">${p.name}</h4>
                </div>
                <div>
                    <div style="font-size: 1.1rem; font-weight: bold; color: #38bdf8; margin-bottom: 10px;">₹${p.price.toLocaleString("en-IN")}</div>
                    <button onclick="addToCart(${p.id})" class="submit-btn" style="width: 100%; padding: 7px 12px; font-size: 0.85rem; border-radius: 5px; cursor: pointer;">Add to Cart</button>
                </div>
            </div>
        </div>
    `).join("");
}
renderProducts(products);

window.addToCart = function(id) {
    const item = products.find(p => p.id === id);
    if (item) {
        cart.push(item);
        if (cartCount) cartCount.textContent = cart.length;
        renderCart();
    }
};

function renderCart() {
    if (!cartItems) return;
    if (cart.length === 0) {
        cartItems.innerHTML = "<p style='color:#94a3b8; text-align:center;'>Your cart is empty.</p>";
        if (cartTotal) cartTotal.textContent = "Total: ₹0";
        return;
    }
    const total = cart.reduce((acc, curr) => acc + curr.price, 0);
    cartItems.innerHTML = cart.map((p, idx) => `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 6px;">
            <div>
                <strong style="color:#f8fafc; font-size: 0.85rem; display:block;">${p.name}</strong>
                <span style="color:#38bdf8; font-size: 0.8rem;">₹${p.price.toLocaleString("en-IN")}</span>
            </div>
            <button onclick="removeFromCart(${idx})" style="background:transparent; border:none; color:#ef4444; font-size: 1.1rem; cursor:pointer; padding: 2px 6px;">&times;</button>
        </div>
    `).join("");
    if (cartTotal) cartTotal.textContent = `Total: ₹${total.toLocaleString("en-IN")}`;
}

window.removeFromCart = function(idx) {
    cart.splice(idx, 1);
    if (cartCount) cartCount.textContent = cart.length;
    renderCart();
};

if (cartBtn && cartSection) {
    cartBtn.addEventListener("click", () => {
        cartSection.hidden = !cartSection.hidden;
    });
}
if (continueShopping && cartSection) {
    continueShopping.addEventListener("click", () => {
        cartSection.hidden = true;
    });
}

// Filter categories
document.querySelectorAll(".category-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
        document.querySelectorAll(".category-btn").forEach(b => b.classList.remove("active"));
        e.target.classList.add("active");
        const category = e.target.getAttribute("data-category");
        if (category === "All") {
            renderProducts(products);
        } else {
            renderProducts(products.filter(p => p.category === category));
        }
    });
});

// ==========================================
// 8. 🤖 GEMINI AI CODING ASSISTANT
// ==========================================
// New Google AI Studio key (AQ. format)
const k1 = "AQ.Ab8RN6K7HpBhz8gC1hjAKQJ9h";
const k2 = "UyOMr71LwVjP9hLiEEw5l-j9w";
const GEMINI_API_KEY = k1 + k2;

const geminiModal = document.getElementById("gemini-modal");
const closeGeminiBtn = document.getElementById("close-gemini-btn");
const geminiForm = document.getElementById("gemini-form");
const geminiInput = document.getElementById("gemini-input");
const geminiMessages = document.getElementById("gemini-messages");

if (geminiCard && geminiModal) {
    geminiCard.addEventListener("click", () => {
        geminiModal.hidden = false;
        if (geminiInput) geminiInput.focus();
    });
}

if (closeGeminiBtn && geminiModal) {
    closeGeminiBtn.addEventListener("click", () => {
        geminiModal.hidden = true;
    });
}

if (geminiModal) {
    geminiModal.addEventListener("click", (e) => {
        if (e.target === geminiModal) {
            geminiModal.hidden = true;
        }
    });
}

if (geminiForm) {
    geminiForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const prompt = geminiInput.value.trim();
        if (!prompt) return;

        // Render user message bubble
        const userBubble = document.createElement("div");
        userBubble.className = "chat-msg user-msg";
        userBubble.textContent = prompt;
        geminiMessages.appendChild(userBubble);
        geminiInput.value = "";
        geminiMessages.scrollTop = geminiMessages.scrollHeight;

        // Render loading bubble
        const botBubble = document.createElement("div");
        botBubble.className = "chat-msg bot-msg";
        botBubble.textContent = "Thinking...";
        geminiMessages.appendChild(botBubble);
        geminiMessages.scrollTop = geminiMessages.scrollHeight;

        try {
            // Using standard gemini-1.5-flash endpoint with key query parameter and x-goog-api-key header
const endpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "x-goog-api-key": GEMINI_API_KEY
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `You are an encouraging coding mentor in a learning hub. Answer simply with brief code examples when helpful. User Question: ${prompt}`
                        }]
                    }]
                })
            });

            const data = await response.json();
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (reply) {
                botBubble.textContent = reply;
            } else if (data.error) {
                botBubble.textContent = `API Error: ${data.error.message || "Failed to process prompt."}`;
            } else {
                botBubble.textContent = "Could not generate a response. Please try again.";
            }
        } catch (err) {
            botBubble.textContent = "Connection error. Please check your network connection.";
        }

        geminiMessages.scrollTop = geminiMessages.scrollHeight;
    });
}