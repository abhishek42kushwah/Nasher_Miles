const { createEmployeeSheet } = require("../models/employee.model");
const { createDepartmentSheet } = require("../models/department.model");
const { createTodoSheet } = require("../models/todo.model");
const { createChecklistSheets } = require("../models/checklist.model");
const {
  createHelpTicketConfigSheets,
} = require("../models/helpTicketConfig.model");
const { createLocationSheet } = require("../models/location.model");
const { createHelpTicketSheets } = require("../models/helpTicket.model");
const { createDelegationSheets } = require("../models/delegation.model");

createDelegationSheets()
  .then(() => console.log("Delegation migration done"))
  .catch(console.error);

createHelpTicketSheets()
  .then(() => console.log("Help Ticket migration done"))
  .catch(console.error);

createLocationSheet()
  .then(() => console.log("Locations migration done"))
  .catch(console.error);

createEmployeeSheet()
  .then(() => console.log("🎉 Sheet migration done"))
  .catch(console.error);

createTodoSheet()
  .then(() => console.log("Todos migration done"))
  .catch(console.error);

createChecklistSheets()
  .then(() => console.log("Check List migration done"))
  .catch(console.error);

createHelpTicketConfigSheets()
  .then(() => console.log("Help Ticket Config migration done"))
  .catch(console.error);

createDepartmentSheet()
  .then(() => console.log("Departments migration done"))
  .catch(console.error);
