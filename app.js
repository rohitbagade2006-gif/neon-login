
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

let isSignup = false;
let clockInterval;

function showMessage(text, type = "") {
    message.textContent = text;
    message.className = type;
}

function clearMessage() {
    showMessage("");
}

function updateClock() {
    liveClock.textContent = new Date().toLocaleTimeString();
}

function startClock() {
    clearInterval(clockInterval);
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
}

function showDashboard(user) {
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

    title.textContent = isSignup
        ? "Create Account"
        : "Welcome Back";

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
        showMessage("Password must contain at least 6 characters.", "error");
        return;
    }

    setLoading(true);

    try {
        if (isSignup) {
            const fullName = fullname.value.trim();

            if (!fullName) {
                showMessage("Please enter your full name.", "error");
                return;
            }

            const { data, error } =
                await supabaseClient.auth.signUp({
                    email: email,
                    password: pass,
                    options: {
                        data: {
                            full_name: fullName
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
                    email: email,
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

// Restore an existing login when the page is reopened.
async function restoreSession() {
    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        showMessage("Could not restore your session. Please log in.", "error");
        return;
    }

    if (data.session) {
        showDashboard(data.session.user);
    }
}

restoreSession();

// Handle a password-reset link opened from email.
supabaseClient.auth.onAuthStateChange((event) => {
    if (event === "PASSWORD_RECOVERY") {
        setTimeout(async () => {
            const newPassword = prompt("Enter your new password (at least 6 characters):");

            if (!newPassword || newPassword.length < 6) {
                showMessage("Password must contain at least 6 characters.", "error");
                return;
            }

            const { error } = await supabaseClient.auth.updateUser({
                password: newPassword
            });

            if (error) {
                showMessage(error.message, "error");
            } else {
                showMessage("Password updated successfully. You can log in.", "success");
            }
        }, 0);
    }
});