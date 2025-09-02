const express = require("express");
const router = express.Router();
const db = require("../db");

// Get all todos
router.get("/", (req, res) => {
  db.query("SELECT * FROM todos", (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Add new todo
router.post("/", (req, res) => {
  const { task } = req.body;
  db.query("INSERT INTO todos (task) VALUES (?)", [task], (err, result) => {
    if (err) throw err;
    res.json({ id: result.insertId, task });
  });
});

// Delete todo
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM todos WHERE id=?", [id], (err) => {
    if (err) throw err;
    res.json({ message: "Todo deleted" });
  });
});

module.exports = router;
