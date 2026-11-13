const express = require('express');
const router = express.Router();
const {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  deleteTicket
} = require('../controllers/ticketController');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, createTicket);
router.get('/', auth, getAllTickets);
router.get('/:id', auth, getTicketById);
router.put('/:id', auth, updateTicket);
router.delete('/:id', auth, deleteTicket);

module.exports = router;