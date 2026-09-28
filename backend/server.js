const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors({
    origin: [
        "http://127.0.0.1:5502",
        "http://localhost:5502"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

/* =====================================================
   MONGOOSE MODELS
===================================================== */

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const expenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    paymentMethod: {
        type: String,
        default: "Cash"
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const incomeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    source: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const budgetSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    category: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
});

const emergencyFundSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    currentAmount: {
        type: Number,
        default: 0
    },
    targetAmount: {
        type: Number,
        default: 20000
    }
});

const futureExpenseSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model("User", userSchema);
const Expense = mongoose.model("Expense", expenseSchema);
const Income = mongoose.model("Income", incomeSchema);
const Budget = mongoose.model("Budget", budgetSchema);
const EmergencyFund = mongoose.model("EmergencyFund", emergencyFundSchema);
const FutureExpense = mongoose.model("FutureExpense", futureExpenseSchema);


/* =====================================================
   AUTHENTICATION MIDDLEWARE
===================================================== */

function authenticate(req, res, next) {

    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            message: "Authentication required"
        });
    }

    try {

        const actualToken = token.replace("Bearer ", "");

        const decoded = jwt.verify(
            actualToken,
            JWT_SECRET
        );

        req.userId = decoded.userId;

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}


/* =====================================================
   REGISTER
===================================================== */

app.post("/api/auth/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill all fields"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name: name,
            email: email.toLowerCase(),
            password: hashedPassword
        });

        await user.save();

        const token = jwt.sign(
            {
                userId: user._id
            },
            JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        const fund = new EmergencyFund({
            userId: user._id,
            currentAmount: 0,
            targetAmount: 20000
        });

        await fund.save();

        res.status(201).json({
            message: "Account created successfully",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Registration failed"
        });
    }
});


/* =====================================================
   LOGIN
===================================================== */

app.post("/api/auth/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id
            },
            JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        res.json({
            message: "Login successful",
            token: token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Login failed"
        });
    }
});


/* =====================================================
   USER PROFILE
===================================================== */

app.get("/api/auth/profile", authenticate, async (req, res) => {

    try {

        const user = await User.findById(req.userId)
            .select("-password");

        res.json(user);

    } catch (error) {

        res.status(500).json({
            message: "Could not load profile"
        });
    }
});


/* =====================================================
   EXPENSES
===================================================== */

app.get("/api/expenses", authenticate, async (req, res) => {

    try {

        const expenses = await Expense.find({
            userId: req.userId
        }).sort({
            date: -1
        });

        res.json(expenses);

    } catch (error) {

        res.status(500).json({
            message: "Could not load expenses"
        });
    }
});


app.post("/api/expenses", authenticate, async (req, res) => {

    try {

        const {
            amount,
            category,
            description,
            paymentMethod
        } = req.body;

        if (!amount || !category) {
            return res.status(400).json({
                message: "Amount and category are required"
            });
        }

        const expense = new Expense({
            userId: req.userId,
            amount: Number(amount),
            category: category,
            description: description || "",
            paymentMethod: paymentMethod || "Cash"
        });

        await expense.save();

        res.status(201).json(expense);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Could not add expense"
        });
    }
});


app.delete("/api/expenses/:id", authenticate, async (req, res) => {

    try {

        await Expense.deleteOne({
            _id: req.params.id,
            userId: req.userId
        });

        res.json({
            message: "Expense deleted"
        });

    } catch (error) {

        res.status(500).json({
            message: "Could not delete expense"
        });
    }
});


/* =====================================================
   INCOME
===================================================== */

app.get("/api/income", authenticate, async (req, res) => {

    try {

        const income = await Income.find({
            userId: req.userId
        }).sort({
            date: -1
        });

        res.json(income);

    } catch (error) {

        res.status(500).json({
            message: "Could not load income"
        });
    }
});


app.post("/api/income", authenticate, async (req, res) => {

    try {

        const {
            amount,
            source,
            description
        } = req.body;

        if (!amount || !source) {
            return res.status(400).json({
                message: "Amount and source are required"
            });
        }

        const income = new Income({
            userId: req.userId,
            amount: Number(amount),
            source: source,
            description: description || ""
        });

        await income.save();

        res.status(201).json(income);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Could not add income"
        });
    }
});


app.delete("/api/income/:id", authenticate, async (req, res) => {

    try {

        await Income.deleteOne({
            _id: req.params.id,
            userId: req.userId
        });

        res.json({
            message: "Income deleted"
        });

    } catch (error) {

        res.status(500).json({
            message: "Could not delete income"
        });
    }
});


/* =====================================================
   BUDGET
===================================================== */

app.get("/api/budgets", authenticate, async (req, res) => {

    try {

        const budgets = await Budget.find({
            userId: req.userId
        });

        res.json(budgets);

    } catch (error) {

        res.status(500).json({
            message: "Could not load budgets"
        });
    }
});


app.post("/api/budgets", authenticate, async (req, res) => {

    try {

        const {
            category,
            amount
        } = req.body;

        const existing = await Budget.findOne({
            userId: req.userId,
            category: category
        });

        if (existing) {

            existing.amount = Number(amount);

            await existing.save();

            return res.json(existing);
        }

        const budget = new Budget({
            userId: req.userId,
            category: category,
            amount: Number(amount)
        });

        await budget.save();

        res.status(201).json(budget);

    } catch (error) {

        res.status(500).json({
            message: "Could not save budget"
        });
    }
});


/* =====================================================
   EMERGENCY FUND
===================================================== */

app.get("/api/emergency", authenticate, async (req, res) => {

    try {

        let fund = await EmergencyFund.findOne({
            userId: req.userId
        });

        if (!fund) {

            fund = new EmergencyFund({
                userId: req.userId,
                currentAmount: 0,
                targetAmount: 20000
            });

            await fund.save();
        }

        const percentage =
            fund.targetAmount > 0
                ? Math.min(
                    100,
                    (fund.currentAmount / fund.targetAmount) * 100
                )
                : 0;

        const quickAccess =
            fund.currentAmount * 0.20;

        const hardLock =
            fund.currentAmount * 0.80;

        res.json({
            currentAmount: fund.currentAmount,
            targetAmount: fund.targetAmount,
            percentage: percentage,
            quickAccess: quickAccess,
            hardLock: hardLock
        });

    } catch (error) {

        res.status(500).json({
            message: "Could not load emergency fund"
        });
    }
});


app.post("/api/emergency/add", authenticate, async (req, res) => {

    try {

        const amount = Number(req.body.amount);

        if (amount <= 0) {
            return res.status(400).json({
                message: "Enter a valid amount"
            });
        }

        let fund = await EmergencyFund.findOne({
            userId: req.userId
        });

        if (!fund) {

            fund = new EmergencyFund({
                userId: req.userId
            });
        }

        fund.currentAmount += amount;

        await fund.save();

        res.json({
            message: "Amount added",
            currentAmount: fund.currentAmount
        });

    } catch (error) {

        res.status(500).json({
            message: "Could not add amount"
        });
    }
});


app.post("/api/emergency/withdraw", authenticate, async (req, res) => {

    try {

        const amount = Number(req.body.amount);

        const fund = await EmergencyFund.findOne({
            userId: req.userId
        });

        if (!fund) {
            return res.status(404).json({
                message: "Emergency fund not found"
            });
        }

        if (amount <= 0 || amount > fund.currentAmount) {
            return res.status(400).json({
                message: "Invalid withdrawal amount"
            });
        }

        fund.currentAmount -= amount;

        await fund.save();

        res.json({
            message: "Withdrawal successful",
            currentAmount: fund.currentAmount
        });

    } catch (error) {

        res.status(500).json({
            message: "Could not withdraw amount"
        });
    }
});


/* =====================================================
   FUTURE EXPENSES
===================================================== */

app.get("/api/future-expenses", authenticate, async (req, res) => {

    try {

        const expenses = await FutureExpense.find({
            userId: req.userId
        }).sort({
            date: -1
        });

        res.json(expenses);

    } catch (error) {

        res.status(500).json({
            message: "Could not load future expenses"
        });
    }
});


app.post("/api/future-expenses", authenticate, async (req, res) => {

    try {

        const {
            name,
            amount
        } = req.body;

        if (!name || !amount) {
            return res.status(400).json({
                message: "Name and amount are required"
            });
        }

        const futureExpense = new FutureExpense({
            userId: req.userId,
            name: name,
            amount: Number(amount)
        });

        await futureExpense.save();

        res.status(201).json(futureExpense);

    } catch (error) {

        res.status(500).json({
            message: "Could not add future expense"
        });
    }
});


app.delete("/api/future-expenses/:id", authenticate, async (req, res) => {

    try {

        await FutureExpense.deleteOne({
            _id: req.params.id,
            userId: req.userId
        });

        res.json({
            message: "Future expense deleted"
        });

    } catch (error) {

        res.status(500).json({
            message: "Could not delete future expense"
        });
    }
});


/* =====================================================
   DASHBOARD SUMMARY
===================================================== */

app.get("/api/dashboard", authenticate, async (req, res) => {

    try {

        const expenses = await Expense.find({
            userId: req.userId
        });

        const income = await Income.find({
            userId: req.userId
        });

        const budgets = await Budget.find({
            userId: req.userId
        });

        let totalExpenses = 0;
        let totalIncome = 0;

        for (let i = 0; i < expenses.length; i++) {
            totalExpenses += expenses[i].amount;
        }

        for (let i = 0; i < income.length; i++) {
            totalIncome += income[i].amount;
        }

        const categoryTotals = {};

        for (let i = 0; i < expenses.length; i++) {

            const category = expenses[i].category;

            if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
            }

            categoryTotals[category] += expenses[i].amount;
        }

        res.json({
            totalIncome: totalIncome,
            totalExpenses: totalExpenses,
            balance: totalIncome - totalExpenses,
            categoryTotals: categoryTotals,
            budgets: budgets
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Could not load dashboard"
        });
    }
});


/* =====================================================
   ROOT
===================================================== */

app.get("/", (req, res) => {

    res.send("Student Expense Tracker API is running");
});


/* =====================================================
   DATABASE CONNECTION
===================================================== */

mongoose.connect(MONGO_URI)
    .then(() => {

        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {

            console.log(
                `Server running at http://localhost:${PORT}`
            );

        });

    })
    .catch((error) => {

        console.log("MongoDB connection failed");

        console.log(error);
    });