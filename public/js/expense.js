
if (localStorage.getItem("isLoggedIn") !== "true") {
    alert("Please login to access the Expense Tracker");
    window.location.href = "/login";
}

const form = document.getElementById("expenseForm");
const tableBody = document.getElementById("expenseTableBody");
const logoutBtn = document.getElementById("logoutBtn");

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("isPremiumUser");
    window.location.href = "/login";
});

function showPremiumUserUI() {
    const buyPremiumBtn = document.getElementById("buyPremiumBtn");
    const premiumHeadline = document.getElementById("premiumHeadline");
    const showLeaderboardBtn = document.getElementById("showLeaderboardBtn");
    const downloadExpensesBtn = document.getElementById("downloadExpensesBtn");
    const reportsBtn = document.getElementById("reportsBtn");
    const reportTooltip = document.getElementById("reportTooltip");

    if (buyPremiumBtn) {
        buyPremiumBtn.style.display = "none";
    }
    if (premiumHeadline) {
        premiumHeadline.style.display = "inline-block";
    }
    if (showLeaderboardBtn) {
        showLeaderboardBtn.style.display = "inline-block";
    }
    if (downloadExpensesBtn) {
        downloadExpensesBtn.disabled = false;
        downloadExpensesBtn.title = "Download your expenses";
    }
    if (reportsBtn) {
        reportsBtn.classList.remove("non-premium");
        reportsBtn.title = "View Day to Day Reports";
    }
    if (reportTooltip) {
        reportTooltip.classList.remove("visible");
    }
}

async function checkPremiumStatus() {
    const email = localStorage.getItem("userEmail");
    if (localStorage.getItem("isPremiumUser") === "true") {
        showPremiumUserUI();
    }
    if (email) {
        try {
            const response = await axios.get(`/purchase/userstatus?email=${encodeURIComponent(email)}`);
            if (response.data.isPremiumUser) {
                localStorage.setItem("isPremiumUser", "true");
                showPremiumUserUI();
            } else {
                localStorage.setItem("isPremiumUser", "false");
            }
        } catch (err) {
            console.error("Error checking premium status:", err);
        }
    }
}

let currentPage = 1;
let itemsPerPage = parseInt(localStorage.getItem("itemsPerPage")) || 5;

const itemsPerPageSelect = document.getElementById("itemsPerPage");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInfo = document.getElementById("pageInfo");

if (itemsPerPageSelect) {
    itemsPerPageSelect.value = itemsPerPage;
    itemsPerPageSelect.addEventListener("change", (e) => {
        itemsPerPage = parseInt(e.target.value);
        localStorage.setItem("itemsPerPage", itemsPerPage);
        currentPage = 1;
        fetchExpenses(1);
    });
}

if (prevBtn) {
    prevBtn.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            fetchExpenses(currentPage);
        }
    });
}

if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        currentPage++;
        fetchExpenses(currentPage);
    });
}

window.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const returnOrderId = urlParams.get("order_id");
    const email = localStorage.getItem("userEmail");

    if (returnOrderId && email) {
        try {
            const updateRes = await axios.post("/purchase/updatetransactionstatus", {
                orderId: returnOrderId,
                email,
            });
            if (updateRes.data.isPremiumUser) {
                alert("Transaction successful");
                localStorage.setItem("isPremiumUser", "true");
                showPremiumUserUI();
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        } catch (err) {
            console.error("Error verifying order from return URL:", err);
        }
    }

    await fetchExpenses(1);
    await checkPremiumStatus();
});

async function fetchExpenses(page = currentPage) {
    currentPage = page;
    const email = localStorage.getItem("userEmail");
    const userId = localStorage.getItem("userId");

    try {
        const response = await axios.get("/api/expenses", {
            params: {
                email,
                userId,
                page: currentPage,
                limit: itemsPerPage,
            },
            headers: {
                "user-email": email || "",
                "user-id": userId || "",
            },
        });

        const expenses = Array.isArray(response.data) ? response.data : (response.data.expenses || []);
        const totalPages = response.data.totalPages || 1;

        // Edge case fallback: if current page has no expenses and currentPage > 1, step back to previous page
        if (expenses.length === 0 && currentPage > 1) {
            currentPage--;
            return await fetchExpenses(currentPage);
        }

        tableBody.innerHTML = "";

        if (expenses.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: #888;">No expenses found.</td></tr>`;
        } else {
            expenses.forEach((expense) => {
                addExpenseToTable(expense);
            });
        }

        if (pageInfo) {
            pageInfo.innerText = currentPage;
        }
        if (prevBtn) {
            prevBtn.disabled = currentPage <= 1;
        }
        if (nextBtn) {
            nextBtn.disabled = currentPage >= totalPages || expenses.length === 0;
        }
    } catch (err) {
        console.error("Error fetching expenses:", err);
    }
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = localStorage.getItem("userEmail");
    const userId = localStorage.getItem("userId");

    const expenseData = {
        amount: document.getElementById("amount").value,
        description: document.getElementById("description").value,
        category: document.getElementById("category").value,
        note: document.getElementById("note").value,
        email: email,
        userId: userId,
    };

    try {
        await axios.post("/api/expenses", expenseData, {
            headers: {
                "user-email": email || "",
                "user-id": userId || "",
            },
        });
        currentPage = 1;
        await fetchExpenses(1);
        form.reset();
    } catch (err) {
        console.error("Error adding expense:", err);
        alert("Failed to add expense");
    }
});

function addExpenseToTable(expense) {
    const tr = document.createElement("tr");
    tr.id = `expense-${expense.id}`;
    tr.innerHTML = `
        <td>₹${expense.amount}</td>
        <td>${expense.description}</td>
        <td>${expense.category}</td>
        <td>
            <button class="delete-btn" onclick="deleteExpense(${expense.id})">Delete Expense</button>
        </td>
    `;
    tableBody.appendChild(tr);
}

async function deleteExpense(id) {
    const email = localStorage.getItem("userEmail");
    const userId = localStorage.getItem("userId");

    try {
        await axios.delete(`/api/expenses/${id}`, {
            params: { email, userId },
            headers: {
                "user-email": email || "",
                "user-id": userId || "",
            },
        });

        // Edge case: if we just deleted the only item on the current page, go back to previous page
        const expenseRows = tableBody.querySelectorAll("tr[id^='expense-']");
        if (expenseRows.length <= 1 && currentPage > 1) {
            currentPage--;
        }

        await fetchExpenses(currentPage);
    } catch (err) {
        console.error("Error deleting expense:", err);
        alert("Failed to delete expense");
    }
}

const buyPremiumBtn = document.getElementById("buyPremiumBtn");

buyPremiumBtn.addEventListener("click", async () => {
    const email = localStorage.getItem("userEmail");

    try {
        const response = await axios.post("/purchase/premiummembership", { email });
        const { orderId, paymentSessionId } = response.data;

        const cashfree = Cashfree({ mode: "sandbox" });

        cashfree.checkout({
            paymentSessionId: paymentSessionId,
            redirectTarget: "_modal",
        }).then(async function () {
            try {
                const updateRes = await axios.post("/purchase/updatetransactionstatus", {
                    orderId: orderId,
                    email: email,
                });

                if (updateRes.data.isPremiumUser) {
                    alert("Transaction successful");
                    localStorage.setItem("isPremiumUser", "true");
                    showPremiumUserUI();
                } else {
                    alert("TRANSACTION FAILED");
                }
            } catch (err) {
                alert("TRANSACTION FAILED");
            }
        });
    } catch (err) {
        console.error("Error initiating payment:", err);
        alert("TRANSACTION FAILED");
    }
});

const showLeaderboardBtn = document.getElementById("showLeaderboardBtn");
const leaderboardSection = document.getElementById("leaderboardSection");
const leaderboardTableBody = document.getElementById("leaderboardTableBody");

if (showLeaderboardBtn) {
    showLeaderboardBtn.addEventListener("click", async () => {
        try {
            const response = await axios.get("/premium/showLeaderboard");
            if (leaderboardTableBody) {
                leaderboardTableBody.innerHTML = "";
                response.data.forEach((user, index) => {
                    const tr = document.createElement("tr");
                    tr.innerHTML = `
                        <td>${index + 1}</td>
                        <td>${user.name}</td>
                        <td>₹${user.total_cost || user.totalExpense || 0}</td>
                    `;
                    leaderboardTableBody.appendChild(tr);
                });
            }
            if (leaderboardSection) {
                leaderboardSection.style.display = "block";
            }
        } catch (err) {
            console.error("Error loading leaderboard:", err);
            alert("Failed to load leaderboard");
        }
    });
}

const descriptionInput = document.getElementById("description");
const categorySelect = document.getElementById("category");
const suggestCategoryBtn = document.getElementById("suggestCategoryBtn");

if (suggestCategoryBtn && descriptionInput && categorySelect) {
    suggestCategoryBtn.addEventListener("click", async () => {
        const description = descriptionInput.value.trim();
        if (!description) {
            alert("Please enter a description first");
            descriptionInput.focus();
            return;
        }

        const originalText = suggestCategoryBtn.innerText;
        suggestCategoryBtn.innerText = "Suggesting...";
        suggestCategoryBtn.disabled = true;

        try {
            const response = await axios.post("/ai/suggest-category", { description });
            if (response.data && response.data.category) {
                categorySelect.value = response.data.category;
            }
        } catch (err) {
            console.error("AI category suggestion error:", err);
        } finally {
            suggestCategoryBtn.innerText = originalText;
            suggestCategoryBtn.disabled = false;
        }
    });
}

const downloadExpensesBtn = document.getElementById("downloadExpensesBtn");

if (downloadExpensesBtn) {
    downloadExpensesBtn.addEventListener("click", async () => {
        const isPremium = localStorage.getItem("isPremiumUser") === "true";
        if (!isPremium) {
            alert("Download is disabled for non-premium users!");
            return;
        }

        const email = localStorage.getItem("userEmail");
        const userId = localStorage.getItem("userId");

        try {
            const response = await axios.get("/api/expenses", {
                params: { email, userId },
                headers: {
                    "user-email": email || "",
                    "user-id": userId || "",
                },
            });

            const expenses = response.data || [];
            let csvContent = "data:text/csv;charset=utf-8,Amount,Description,Category\n";
            expenses.forEach((exp) => {
                csvContent += `${exp.amount},"${exp.description}","${exp.category}"\n`;
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "my_expenses.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Error exporting expenses:", err);
            alert("Failed to download expenses");
        }
    });
}

const reportsBtn = document.getElementById("reportsBtn");
if (reportsBtn) {
    reportsBtn.addEventListener("click", () => {
        const isPremium = localStorage.getItem("isPremiumUser") === "true";
        if (!isPremium) {
            alert("Day to Day Reports are only for Premium Users! Please buy premium membership.");
            return;
        }
        window.location.href = "/reports";
    });
}
