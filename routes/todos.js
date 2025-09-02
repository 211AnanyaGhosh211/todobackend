const express = require("express");
const router = express.Router();
const Todo = require("../models/Todo");

// Get all todos with filtering and sorting
router.get("/", async (req, res) => {
  try {
    const { 
      completed, 
      priority, 
      category, 
      sortBy = 'createdAt', 
      sortOrder = 'desc',
      limit = 50,
      page = 1
    } = req.query;

    // Build filter object
    const filter = {};
    if (completed !== undefined) filter.completed = completed === 'true';
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const todos = await Todo.find(filter)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .lean();

    // Get total count for pagination
    const total = await Todo.countDocuments(filter);

    res.json({
      todos,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("Error fetching todos:", err);
    res.status(500).json({ error: "Failed to fetch todos" });
  }
});

// Get overdue todos
router.get("/overdue", async (req, res) => {
  try {
    const overdueTodos = await Todo.findOverdue().sort({ dueDate: 1 });
    res.json(overdueTodos);
  } catch (err) {
    console.error("Error fetching overdue todos:", err);
    res.status(500).json({ error: "Failed to fetch overdue todos" });
  }
});

// Get todos by priority
router.get("/priority/:level", async (req, res) => {
  try {
    const { level } = req.params;
    const todos = await Todo.findByPriority(level);
    res.json(todos);
  } catch (err) {
    console.error("Error fetching todos by priority:", err);
    res.status(500).json({ error: "Failed to fetch todos by priority" });
  }
});

// Get single todo by ID
router.get("/:id", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json(todo);
  } catch (err) {
    console.error("Error fetching todo:", err);
    res.status(500).json({ error: "Failed to fetch todo" });
  }
});

// Add new todo
router.post("/", async (req, res) => {
  try {
    const { task, priority, dueDate, category, tags, notes } = req.body;
    
    const todo = new Todo({
      task,
      priority,
      dueDate: dueDate ? new Date(dueDate) : null,
      category,
      tags: tags || [],
      notes
    });

    const savedTodo = await todo.save();
    res.status(201).json(savedTodo);
  } catch (err) {
    console.error("Error adding todo:", err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: Object.values(err.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ error: "Failed to add todo" });
  }
});

// Update todo
router.put("/:id", async (req, res) => {
  try {
    const { task, completed, priority, dueDate, category, tags, notes } = req.body;
    
    const updateData = {};
    if (task !== undefined) updateData.task = task;
    if (completed !== undefined) updateData.completed = completed;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (category !== undefined) updateData.category = category;
    if (tags !== undefined) updateData.tags = tags;
    if (notes !== undefined) updateData.notes = notes;

    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(todo);
  } catch (err) {
    console.error("Error updating todo:", err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        error: "Validation failed", 
        details: Object.values(err.errors).map(e => e.message) 
      });
    }
    res.status(500).json({ error: "Failed to update todo" });
  }
});

// Toggle todo completion
router.patch("/:id/toggle", async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    todo.completed = !todo.completed;
    const savedTodo = await todo.save();
    res.json(savedTodo);
  } catch (err) {
    console.error("Error toggling todo:", err);
    res.status(500).json({ error: "Failed to toggle todo" });
  }
});

// Delete todo
router.delete("/:id", async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }
    res.json({ message: "Todo deleted successfully", deletedTodo: todo });
  } catch (err) {
    console.error("Error deleting todo:", err);
    res.status(500).json({ error: "Failed to delete todo" });
  }
});

// Bulk delete completed todos
router.delete("/bulk/completed", async (req, res) => {
  try {
    const result = await Todo.deleteMany({ completed: true });
    res.json({ 
      message: `${result.deletedCount} completed todos deleted successfully` 
    });
  } catch (err) {
    console.error("Error bulk deleting todos:", err);
    res.status(500).json({ error: "Failed to bulk delete todos" });
  }
});

module.exports = router;
