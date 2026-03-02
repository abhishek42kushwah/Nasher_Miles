const express = require('express');
const router = express.Router();
const helpTicketController = require('../controllers/helpTicket.controller');
const { verifyToken } = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists (skipped on Vercel)
const uploadDir = 'uploads';
if (process.env.NODE_ENV !== 'production' && !fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer Storage Configuration (Memory for Drive Upload)
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// All routes require authentication
router.use(verifyToken);

// Stage 1: Raise Ticket
router.post('/raise', upload.single('image_upload'), helpTicketController.raiseTicket);

// Stage 2: PC Planning
router.put('/pc-planning/:id', helpTicketController.pcPlanning);

// Stage 3: Solver Action
router.put('/solve/:id', upload.single('proof_upload'), helpTicketController.solveTicket);
router.put('/revise/:id', helpTicketController.reviseTicketDate);

// Stage 4: PC Confirmation
router.put('/pc-confirm/:id', helpTicketController.pcConfirmation);

// Stage 5: Closure / Re-raise
router.put('/close/:id', helpTicketController.closeTicket);
router.put('/reraise/:id', helpTicketController.reraiseTicket);

// Queries
router.get('/', helpTicketController.getTickets);
router.get('/:id', helpTicketController.getTicketById);


// routes/helpTickets-history.routes.js
router.get(
  '/history/:id',
  helpTicketController.getHelpTicketHistoryById
);

module.exports = router;
