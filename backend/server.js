
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// Models
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true }, // ADMIN, PRODUCTION, ENGINEERING
});

const TicketSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: String, // REPAIR, PM
  priority: String,
  status: String,
  dateReported: Date,
  createdBy: String, // User ID
  createdByName: String,
  createdByRole: String,
  imageUrl: String,
  history: [{
    date: Date,
    description: String,
    userId: String,
    userName: String,
    userRole: String,
  }]
});

const User = mongoose.model('User', UserSchema);
const Ticket = mongoose.model('Ticket', TicketSchema);

// Auth Middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// --- Routes ---

// Auth
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
    res.json({ token, user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Users
app.get('/api/users', auth, async (req, res) => {
  const users = await User.find({}, '-password'); // Exclude password
  res.json(users);
});

app.delete('/api/users/:id', auth, async (req, res) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admin only' });
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

// Tickets
app.get('/api/tickets', auth, async (req, res) => {
  const tickets = await Ticket.find().sort({ dateReported: -1 });
  res.json(tickets);
});

app.post('/api/tickets', auth, async (req, res) => {
  try {
    const ticket = new Ticket(req.body);
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/tickets/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/tickets/:id', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Not found' });
    
    // Only creator or admin can delete
    if (ticket.createdBy !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await Ticket.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// History Logs
app.post('/api/tickets/:id/history', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Not found' });
    
    ticket.history.push(req.body);
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/tickets/:id/history/:logId', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    const log = ticket.history.id(req.params.logId);
    if (!log) return res.status(404).json({ error: 'Log not found' });
    
    // Authorization check could go here
    log.description = req.body.description;
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/tickets/:id/history/:logId', auth, async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    ticket.history.pull(req.params.logId);
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Init/Seed for Demo
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  // Create default admin if none exists
  const adminExists = await User.findOne({ username: 'admin' });
  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('1234', 10);
    await new User({ username: 'admin', password: hashedPassword, role: 'ADMIN' }).save();
    console.log('Default Admin created');
  }
});
