const express = require("express");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const verify = require("./jwtAuth");
const pool = require("./db");
require("dotenv").config();

/* MIDDLEWARE */
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());

/* AUTH ROUTES */
app.use("/auth", require("./auth"));

/* TODO ACTION ROUTES */
app.use("/todo-action", verify, require("./todoAction"));

/* CREATE TODO */
app.post("/todos", verify, async (req, res) => {
    try {
        const { description, amount, user_id } = req.body;

        if (!description.trim())
            return res.status(400).json({ error: "Description cannot be empty" });

        if (amount === undefined || amount === null || isNaN(amount))
            return res.status(400).json({ error: "Amount must be a number" });

        if (!user_id)
            return res.status(400).json({ error: "User ID is required" });

        const newTodo = await pool.query(
            `INSERT INTO todo 
            (description, amount, user_id, created_by, updated_by, created_at, updated_at)
            VALUES ($1, $2, $3, $3, $3, NOW(), NOW())
            RETURNING *`,
            [description.trim(), amount, user_id]
        );

        res.json(newTodo.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

/* GET TODOS */
app.get("/todos", verify, async (req, res) => {
    try {
        const { user_id, role } = req.query;

        let query;
        let params = [];

        if (role === "superadmin") {
            query = `
                SELECT 
                    t.todo_id, t.description, t.amount,
                    t.created_at, t.updated_at,
                    t.created_by, t.updated_by,
                    u1.username AS created_by_user,
                    u2.username AS updated_by_user
                FROM todo t
                JOIN users u1 ON t.created_by = u1.user_id
                LEFT JOIN users u2 ON t.updated_by = u2.user_id
                WHERE t.is_deleted = FALSE
                ORDER BY t.updated_at DESC
            `;
        } else {
            query = `
                SELECT 
                    t.todo_id, t.description, t.amount,
                    t.created_at, t.updated_at,
                    t.created_by, t.updated_by,
                    u1.username AS created_by_user,
                    u2.username AS updated_by_user
                FROM todo t
                JOIN users u1 ON t.created_by = u1.user_id
                LEFT JOIN users u2 ON t.updated_by = u2.user_id
                WHERE t.user_id = $1 AND t.is_deleted = FALSE
                ORDER BY t.updated_at DESC
            `;
            params = [user_id];
        }

        const result = await pool.query(query, params);
        res.json(result.rows);

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

/* GET ONE TODO */
app.get("/todos/:id", verify, async (req, res) => {
    try {
        const { id } = req.params;
        const todo = await pool.query("SELECT * FROM todo WHERE todo_id = $1", [id]);
        res.json(todo.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

/* UPDATE TODO */
app.put("/todos/:id", verify, async (req, res) => {
    try {
        const { id } = req.params;
        const { description, amount } = req.body;

        const user_id = req.user.user_id;
        const role = req.user.role;

        if (!description.trim())
            return res.status(400).json({ error: "Description cannot be empty" });

        if (amount === undefined || amount === null || isNaN(amount))
            return res.status(400).json({ error: "Amount must be a number" });

        let result;

        if (role === "superadmin") {
            result = await pool.query(
                `UPDATE todo
                 SET description = $1, amount = $2, updated_at = NOW(), updated_by = $3
                 WHERE todo_id = $4`,
                [description.trim(), amount, user_id, id]
            );
        } else {
            result = await pool.query(
                `UPDATE todo
                 SET description = $1, amount = $2, updated_at = NOW(), updated_by = $3
                 WHERE todo_id = $4 AND user_id = $5`,
                [description.trim(), amount, user_id, id, user_id]
            );
        }

        if (result.rowCount === 0)
            return res.status(404).json({ error: "Todo not found or no permission" });

        res.json({ message: "Todo updated successfully" });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Server error" });
    }
});

/* DELETE TODO */
app.delete("/todos/:id", verify, async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.user_id;
        const role = req.user.role;

        let deleted;

        if (role === "superadmin") {
            deleted = await pool.query(
                `UPDATE todo 
                 SET is_deleted = TRUE, updated_by = $1, updated_at = NOW()
                 WHERE todo_id = $2 AND is_deleted = FALSE 
                 RETURNING *`,
                [user_id, id]
            );
        } else {
            deleted = await pool.query(
                `UPDATE todo 
                 SET is_deleted = TRUE, updated_by = $1, updated_at = NOW()
                 WHERE todo_id = $2 AND created_by = $3 AND is_deleted = FALSE
                 RETURNING *`,
                [user_id, id, user_id]
            );
        }

        if (deleted.rows.length === 0) {
            return res.status(403).json({ error: "Not authorized or todo not found" });
        }

        res.json({ message: "Todo marked as deleted" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Server error" });
    }
});

/* START SERVER */
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));