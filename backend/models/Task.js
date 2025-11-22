import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: 1,
    maxlength: 200
  },
  description: {
    type: String,
    required: [true, 'Task description is required'],
    trim: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for better query performance
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Task', taskSchema);