// Use localhost while developing. After deploying the backend, replace the
// production URL below with your Render backend URL.
const API_URL = window.FARMCONNECT_API_URL ||
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
        ? "http://localhost:5000/api"
        : "https://YOUR-BACKEND.onrender.com/api");
// ================= AUTHENTICATION =================

let isLoginMode = false;


// Switch between Login and Register

function switchAuthMode() {

    isLoginMode = !isLoginMode;

    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");

    const title = document.getElementById("auth-title");
    const subtitle = document.getElementById("auth-subtitle");
    const switchText = document.getElementById("switchText");
    const switchButton = document.getElementById("switchAuth");

    if (isLoginMode) {

        registerForm.classList.add("hidden");
        loginForm.classList.remove("hidden");

        title.textContent = "Welcome Back";
        subtitle.textContent = "Login to your FarmConnect account";

        switchText.textContent = "Don't have an account?";
        switchButton.textContent = "Register";

    } else {

        loginForm.classList.add("hidden");
        registerForm.classList.remove("hidden");

        title.textContent = "Create Account";
        subtitle.textContent = "Join the FarmConnect marketplace";

        switchText.textContent = "Already have an account?";
        switchButton.textContent = "Login";
    }
}
// ================= LOGOUT =================

function logout() {

    // Remove saved login information
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Hide the application
    document.getElementById("app").classList.add("hidden");

    // Show login/register screen
    document.getElementById("auth-screen").classList.remove("hidden");

    // Reset login form
    document.getElementById("loginForm").reset();

    // Clear message
    document.getElementById("authMessage").textContent = "";

    // Make sure Register screen is shown
    if (isLoginMode) {
        switchAuthMode();
    }
}

// ================= REGISTER =================

document.getElementById("registerForm").addEventListener("submit", async function(event) {

    event.preventDefault();

    const name = document.getElementById("registerName").value;
    const email = document.getElementById("registerEmail").value;
    const phone = document.getElementById("registerPhone").value;
    const password = document.getElementById("registerPassword").value;
    const role = document.getElementById("registerRole").value;
    const location = document.getElementById("registerLocation").value;

    try {

        const response = await fetch(`${API_URL}/auth/register`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name,
                email,
                phone,
                password,
                role,
                location
            })
        });

        const data = await response.json();

        const message = document.getElementById("authMessage");

        if (response.ok) {

            message.textContent = "Registration successful! Please login.";

            document.getElementById("registerForm").reset();

            switchAuthMode();

        } else {

            message.textContent = data.message;
        }

    } catch (error) {

        console.error(error);

        document.getElementById("authMessage").textContent =
            "Unable to connect to server.";
    }
});


// ================= LOGIN =================

document.getElementById("loginForm").addEventListener("submit", async function(event) {

    event.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {

        const response = await fetch(`${API_URL}/auth/login`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {

            // Save login information

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));

            // Hide login screen

            document.getElementById("auth-screen")
                .classList.add("hidden");

            // Show website

            document.getElementById("app")
                .classList.remove("hidden");

            // Update user information

            updateUserProfile(data.user);

        } else {

            document.getElementById("authMessage").textContent =
                data.message;
        }

    } catch (error) {

        console.error(error);

        document.getElementById("authMessage").textContent =
            "Unable to connect to server.";
    }
});


// ================= UPDATE PROFILE =================

function updateUserProfile(user) {

    const profileName = document.querySelector(".profile b");
    const profileRole = document.querySelector(".profile p");

    if (profileName) {
        profileName.textContent = user.name;
    }

    if (profileRole) {
        profileRole.textContent = user.role;
    }
}


// ================= CHECK LOGIN =================

window.addEventListener("DOMContentLoaded", function() {

    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {

        const parsedUser = JSON.parse(user);

        document.getElementById("auth-screen")
            .classList.add("hidden");

        document.getElementById("app")
            .classList.remove("hidden");

        updateUserProfile(parsedUser);

    }

});
function showPage(pageName, clickedButton) {

    // Hide all pages
    const pages = document.querySelectorAll(".page");

    pages.forEach(function(page) {
        page.classList.add("hidden");
    });


    // Show selected page
    document.getElementById(pageName)
        .classList.remove("hidden");


    // Change title
    const titles = {
        dashboard: "Dashboard",
        marketplace: "Marketplace",
        orders: "Orders",
        forecast: "AI Demand Forecast",
        logistics: "Smart Logistics"
    };

    document.getElementById("page-title")
        .textContent = titles[pageName];


    // Change active navigation
    const buttons = document.querySelectorAll(".nav-btn");

    buttons.forEach(function(button) {
        button.classList.remove("active");
    });

    if (clickedButton) {
        clickedButton.classList.add("active");
    }
}

// Place order
async function placeOrder(productId) {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login first.");
        return;
    }

    // Find the product name from the marketplace card
    const productCards = document.querySelectorAll(".product-card");
    let productName = "this product";

    productCards.forEach(card => {
        const button = card.querySelector("button");

        if (button && button.getAttribute("onclick")?.includes(productId)) {
            const heading = card.querySelector("h3");

            if (heading) {
                productName = heading.textContent.replace("Fresh ", "");
            }
        }
    });

    const quantity = prompt(
        `How many kg of ${productName} do you want?`
    );

    if (!quantity) return;

    const quantityNumber = Number(quantity);

    if (isNaN(quantityNumber) || quantityNumber <= 0) {
        alert("Please enter a valid quantity.");
        return;
    }

    try {
        const response = await fetch(
            `${API_URL}/orders`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    productId: productId,
                    quantity: quantityNumber
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            alert(
                "✅ Order placed successfully!\n\n" +
                "Product: " + productName + "\n" +
                "Quantity: " + quantityNumber + " kg\n" +
                "Total: ₹" + data.order.totalPrice
            );

            loadMarketplaceProducts();
        } else {
            alert("❌ " + (data.message || "Could not place order"));
        }

    } catch (error) {
        console.error(error);
        alert("❌ Cannot connect to backend.");
    }
}
// ==========================================
// FARMER - ADD NEW PRODUCE
// ==========================================

const produceForm = document.getElementById("produceForm");

if (produceForm) {

    produceForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        // Get JWT token
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please login first.");
            return;
        }

        // Get form values
        const name = document.getElementById("product").value;
        const quantity = document.getElementById("quantity").value;
        const price = document.getElementById("price").value;
        const location = document.getElementById("location").value;

        // Send data to backend
        try {

            const response = await fetch(
                `${API_URL}/products`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        name: name,
                        quantity: Number(quantity),
                        price: Number(price),
                        location: location
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                alert("✅ Produce added successfully!");

                // Clear form
                produceForm.reset();

                console.log("Product saved:", data.product);

            } else {

                alert("❌ " + (data.message || "Failed to add produce"));

                console.error(data);
            }

        } catch (error) {

            console.error("Error:", error);

            alert(
                "❌ Cannot connect to backend. Make sure your server is running."
            );
        }
    });
}
// ==========================================
// MARKETPLACE - LOAD REAL PRODUCTS
// ==========================================

async function loadMarketplaceProducts() {

    const productsContainer = document.querySelector(".products");

    if (!productsContainer) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/products`
        );

        const products = await response.json();

        if (!response.ok) {
            throw new Error(products.message || "Failed to load products");
        }

        // Clear the existing hard-coded products
        productsContainer.innerHTML = "";

        if (products.length === 0) {

            productsContainer.innerHTML = `
                <div class="empty-marketplace">
                    <h3>🌾 No produce available</h3>
                    <p>Farmers haven't listed any produce yet.</p>
                </div>
            `;

            return;
        }

        // Create product cards
        products.forEach(product => {

            const card = document.createElement("div");

            card.className = "product-card";

            card.innerHTML = `
                <div class="product-image">
                    ${getProductEmoji(product.name)}
                </div>

                <h3>Fresh ${product.name}</h3>

                <p>
                    👨‍🌾 ${product.farmer?.name || "Farmer"}
                </p>

                <p>
                    📍 ${product.location}
                </p>

                <div class="product-bottom">
                    <strong>₹${product.price}/kg</strong>

                    <span>
                        ${product.quantity} kg available
                    </span>
                </div>

                <button onclick="placeOrder('${product._id}')">
                    Buy Now
                </button>
            `;

            productsContainer.appendChild(card);
        });

    } catch (error) {

        console.error("Marketplace error:", error);

        productsContainer.innerHTML = `
            <div class="empty-marketplace">
                <h3>❌ Unable to load products</h3>
                <p>Please make sure the backend is running.</p>
            </div>
        `;
    }
}


// ==========================================
// PRODUCT EMOJI
// ==========================================

function getProductEmoji(productName) {

    const name = productName.toLowerCase();

    if (name.includes("tomato")) return "🍅";
    if (name.includes("potato")) return "🥔";
    if (name.includes("onion")) return "🧅";
    if (name.includes("apple")) return "🍎";
    if (name.includes("rice")) return "🌾";
    if (name.includes("wheat")) return "🌾";
    if (name.includes("carrot")) return "🥕";
    if (name.includes("mango")) return "🥭";

    return "🌱";
}


// ==========================================
// LOAD MARKETPLACE WHEN PAGE OPENS
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    loadMarketplaceProducts();

});
const translations = {
   en: {
    marketplace: "Marketplace",
    addProduce: "Add Produce",
    orders: "Orders",
    buyNow: "Buy Now",
    product: "Product",
    quantity: "Quantity",
    price: "Price",
    location: "Location",
    farmer: "Farmer",
    language: "Language"
},

hi: {
    marketplace: "बाज़ार",
    addProduce: "उपज जोड़ें",
    orders: "ऑर्डर",
    buyNow: "खरीदें",
    product: "उत्पाद",
    quantity: "मात्रा",
    price: "कीमत",
    location: "स्थान",
    farmer: "किसान",
    language: "भाषा"
}
};
function changeLanguage(language) {

    const elements = document.querySelectorAll("[data-translate]");

    elements.forEach(element => {

        const key = element.getAttribute("data-translate");

        if (translations[language] && translations[language][key]) {
            element.textContent = translations[language][key];
        }

    });

    localStorage.setItem("language", language);
}


document.addEventListener("DOMContentLoaded", function () {

    const languageSelect = document.getElementById("languageSelect");

    if (languageSelect) {

        const savedLanguage =
            localStorage.getItem("language") || "en";

        languageSelect.value = savedLanguage;

        changeLanguage(savedLanguage);

        languageSelect.addEventListener("change", function () {
            changeLanguage(this.value);
        });
    }

});
