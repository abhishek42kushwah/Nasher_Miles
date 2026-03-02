const express = require('express');
const router = express.Router();
const checklistController = require('../controllers/checklist.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Checklist Master Routes (Templates)
router.post('/master', verifyToken, checklistController.createChecklistMaster);
router.put('/master/:id', verifyToken, checklistController.updateChecklistMaster);
router.delete('/master/:id', verifyToken, checklistController.deleteChecklistMaster);

// Configure Multer for proof file uploads
const multer = require('multer');
const fs = require('fs');

// Ensure uploads directory exists (skipped on Vercel)
const uploadDir = 'uploads';
if (process.env.NODE_ENV !== 'production' && !fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Checklist Task Routes (Instances)
router.get('/', verifyToken, checklistController.getChecklists); // Fetch all
router.patch('/task/:id', verifyToken, upload.single('proof_file'), checklistController.updateChecklistStatus); // Status with file upload
router.put('/task/:id', verifyToken, checklistController.updateChecklistTaskDetails); // Full edit
router.delete('/task/:id', verifyToken, checklistController.deleteChecklistTask);

// TEST ROUTE: Trigger daily generation immediately
router.get('/test-generation', (req, res) => {
    checklistController.generateDailyTasks();
    res.send('Checklist generation triggered! Check server logs.');
});

module.exports = router;
