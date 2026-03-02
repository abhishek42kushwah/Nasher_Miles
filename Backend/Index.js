require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Main Route
app.get('/', (req, res) => {
    res.send('ERP Backend is running');
});

// Import Models & Routes
const { createEmployeeSheet } = require('./src/models/employee.model');
const { createDelegationSheets } = require('./src/models/delegation.model');
const { createDepartmentSheet } = require('./src/models/department.model');
const { createChecklistSheets } = require('./src/models/checklist.model');
const { createHelpTicketSheets } = require('./src/models/helpTicket.model');
const { createTodoSheet } = require('./src/models/todo.model');
const { createLocationSheet } = require('./src/models/location.model');
const { createHelpTicketConfigSheets } = require('./src/models/helpTicketConfig.model');
const { startChecklistCron } = require('./src/controllers/checklist.controller');

const authRoutes = require('./src/routes/auth.routes');
const delegationRoutes = require('./src/routes/delegation.routes');
const employeeRoutes = require('./src/routes/employee.routes');
const checklistRoutes = require('./src/routes/checklist.routes');
const helpTicketRoutes = require('./src/routes/helpTicket.routes');
const todoRoutes = require('./src/routes/todo.routes');
const helpTicketConfigRoutes = require('./src/routes/helpTicketConfig.routes');


// Routes registration
app.use('/api/auth', authRoutes);
app.use('/api/delegations', delegationRoutes);
app.use('/api/master', employeeRoutes);
app.use('/api/checklist', checklistRoutes);
app.use('/api/help-tickets', helpTicketRoutes);
app.use('/api/todos', todoRoutes);

app.use('/api/help-ticket-config', helpTicketConfigRoutes);
const fs = require('fs');
if (fs.existsSync('uploads')) {
    app.use('/uploads', express.static('uploads'));
}

// Initialize Database Tables
Promise.all([
    createEmployeeSheet(),
    createDelegationSheets(),
    createDepartmentSheet(),
    createChecklistSheets(),
    createHelpTicketSheets(),
    createTodoSheet(),
    createHelpTicketConfigSheets(),
    createLocationSheet(),
])
    .then(() => {
        console.log('Database synchronization complete');
        startChecklistCron(); // Start the daily task generation cron
    })
    .catch(err => console.error('Database synchronization failed:', err));

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}



module.exports = app;
