const express = require('express');
const router = express.Router();
const helpTicketConfigController = require('../controllers/helpTicketConfig.controller');
const { verifyToken } = require('../middlewares/auth.middleware');

// Config Routes
router.get('/', verifyToken, helpTicketConfigController.getConfig);
router.put('/', verifyToken, helpTicketConfigController.updateConfig);

// Holiday Routes
router.post('/holidays', verifyToken, helpTicketConfigController.addHoliday);
router.delete('/holidays/:id', verifyToken, helpTicketConfigController.removeHoliday);

module.exports = router;
