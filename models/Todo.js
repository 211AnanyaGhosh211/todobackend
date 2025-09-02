const { Schema, model } = require('mongoose');

// Todo Schema
const todoSchema = new Schema({
  task: {
    type: String,
    required: [true, 'Task is required'],
    trim: true,
    minlength: [1, 'Task cannot be empty'],
    maxlength: [500, 'Task cannot exceed 500 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  dueDate: {
    type: Date,
    default: null
  },
  category: {
    type: String,
    trim: true,
    default: 'general'
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for overdue status
todoSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate) return false;
  return !this.completed && new Date() > this.dueDate;
});

// Virtual for days until due
todoSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const due = new Date(this.dueDate);
  const diffTime = due - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Index for better query performance
todoSchema.index({ completed: 1, dueDate: 1 });
todoSchema.index({ category: 1 });
todoSchema.index({ priority: 1 });

// Pre-save middleware to clean up tags
todoSchema.pre('save', function(next) {
  if (this.tags) {
    this.tags = this.tags.filter(tag => tag.trim().length > 0);
  }
  next();
});

// Static method to find overdue todos
todoSchema.statics.findOverdue = function() {
  return this.find({
    completed: false,
    dueDate: { $lt: new Date() }
  });
};

// Static method to find todos by priority
todoSchema.statics.findByPriority = function(priority) {
  return this.find({ priority: priority });
};

// Instance method to mark as complete
todoSchema.methods.markComplete = function() {
  this.completed = true;
  return this.save();
};

// Instance method to mark as incomplete
todoSchema.methods.markIncomplete = function() {
  this.completed = false;
  return this.save();
};

// Instance method to update priority
todoSchema.methods.updatePriority = function(newPriority) {
  this.priority = newPriority;
  return this.save();
};

const Todo = model('Todo', todoSchema);

module.exports = Todo;
