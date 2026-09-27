// Task 2: Protect frontend - visible only after successful login
if (localStorage.getItem("isLoggedIn") !== "true") {
    alert("Please login to access the Expense Tracker");
    window.location.href = "../Login/login.html";
}

const form = document.getElementById("expenseForm");
const tableBody = document.getElementById("expenseTableBody");
const logoutBtn = document.getElementById("logoutBtn");

// Logout button
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    window.location.href = "../Login/login.html";
});

// Task 4: On screen refresh the old expenses should be fetched from the backend
window.addEventListener("DOMContentLoaded", async () => {
    await fetchExpenses();
});

async function fetchExpenses() {
    try {
        const response = await axios.get("/api/expenses");
        tableBody.innerHTML = "";
        response.data.forEach((expense) => {
            addExpenseToTable(expense);
        });
    } catch (err) {
        console.error("Error fetching expenses:", err);
    }
}

// Task 3: When user adds an expense it should be added to an expense table
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const expenseData = {
        amount: document.getElementById("amount").value,
        description: document.getElementById("description").value,
        category: document.getElementById("category").value,
    };

    try {
        const response = await axios.post("/api/expenses", expenseData);
        addExpenseToTable(response.data);
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

// Delete expense helper
async function deleteExpense(id) {
    try {
        await axios.delete(`/api/expenses/${id}`);
        const row = document.getElementById(`expense-${id}`);
        if (row) {
            row.remove();
        }
    } catch (err) {
        console.error("Error deleting expense:", err);
        alert("Failed to delete expense");
    }
}

// Buy Premium Membership - Cashfree Integration
const buyPremiumBtn = document.getElementById("buyPremiumBtn");

buyPremiumBtn.addEventListener("click", async () => {
    const email = localStorage.getItem("userEmail");

    try {
        // Step 1: Call backend to create order on Cashfree
        const response = await axios.post("/purchase/premiummembership", { email });
        const { orderId, paymentSessionId } = response.data;

        // Step 2: Initialize Cashfree in sandbox mode
        const cashfree = Cashfree({ mode: "sandbox" });

        // Step 3: Open checkout modal
        cashfree.checkout({
            paymentSessionId: paymentSessionId,
            redirectTarget: "_modal",
        }).then(async function () {
            // Step 4: After modal closes, verify payment status from backend
            try {
                const updateRes = await axios.post("/purchase/updatetransactionstatus", {
                    orderId: orderId,
                    email: email,
                });

                if (updateRes.data.isPremiumUser) {
                    alert("Transaction successful");
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
