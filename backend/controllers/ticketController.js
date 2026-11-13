const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');

// Only the user who created the ticket or an admin can change / delete it
const canManageTicket = (req, ticket) =>
  req.user.role === 'admin' || String(ticket.createdBy) === req.user.id;

exports.createTicket = async (req, res) => {
  try {
    const { title, description, priority, status } = req.body;
    const ticket = new Ticket({
      title,
      description,
      priority,
      status,
      createdBy: req.user.id
    });
    await ticket.save();
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find().populate('createdBy', 'name email role');
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: 'Invalid ticket id' });
    const ticket = await Ticket.findById(req.params.id).populate('createdBy', 'name email');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: 'Invalid ticket id' });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (!canManageTicket(req, ticket))
      return res.status(403).json({ message: 'Access denied: only the ticket creator or an admin can update it' });

    const { title, description, priority, status } = req.body;
    if (title !== undefined) ticket.title = title;
    if (description !== undefined) ticket.description = description;
    if (priority !== undefined) ticket.priority = priority;
    if (status !== undefined) ticket.status = status;

    const updatedTicket = await ticket.save();
    res.json(updatedTicket);
  } catch (err) {
    if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
    res.status(500).json({ error: err.message });
  }
};

exports.deleteTicket = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id))
      return res.status(400).json({ message: 'Invalid ticket id' });

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

    if (!canManageTicket(req, ticket))
      return res.status(403).json({ message: 'Access denied: only the ticket creator or an admin can delete it' });

    await ticket.deleteOne();
    res.json({ message: 'Ticket deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
