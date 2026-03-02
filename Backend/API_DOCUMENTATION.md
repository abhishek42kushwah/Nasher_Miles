# ERP API Documentation

This document provides details for the authentication and employee management API endpoints.

**Base URL**: `http://localhost:5000`

---

## Authentication Endpoints

### 1. Register Employee
Create a new employee record.

- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Access**: Public (Admin only in production)

#### Request Body
```json
{
  "First_Name": "John",
  "Last_Name": "Doe",
  "Work_Email": "john.doe@enterprise.com",
  "Password": "securePassword123",
  "Role": "Employee",
  "Designation": "Software Engineer",
  "Department": "IT",
  "Joining_Date": "2024-01-01"
}
```

> [!NOTE]
> `Joining_Date` is now required by the database. If not provided, it will default to the current date.

#### Success Response
**Code**: `201 Created`
```json
{
  "message": "Employee registered successfully",
  "user": {
    "id": 1,
    "email": "john.doe@enterprise.com",
    "role": "Employee"
  }
}
```

#### Error Response
**Code**: `400 Bad Request` (If email exists)
```json
{
  "message": "Employee with this email already exists"
}
```

---

### 2. Login Employee
Authenticate and receive a JWT token.

- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Access**: Public

#### Request Body
```json
{
  "Work_Email": "john.doe@enterprise.com",
  "Password": "securePassword123"
}
```

#### Success Response
**Code**: `200 OK`
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "john.doe@enterprise.com",
    "role": "Employee",
    "name": "John Doe"
  }
}
```

#### Error Response
**Code**: `400 Bad Request` (Invalid credentials)
```json
{
  "message": "Invalid credentials"
}
```

---

### 3. Get Current Profile
Fetch details of the currently logged-in user.

- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Access**: Private (JWT Required)
- **Headers**: `Authorization: Bearer <your_token>`

#### Success Response
**Code**: `200 OK`
```json
{
  "id": 1,
  "email": "john.doe@enterprise.com",
  "role": "Employee",
  "iat": 1704712345,
  "exp": 1704798745
}
```

#### Error Response
**Code**: `401 Unauthorized` (Missing or invalid token)
```json
{
  "message": "No token, authorization denied"
}
```

---

## Database Schema (Employee Table)
For reference, these are the headers available in the `employees` table:

| Field | Type | Description |
| :--- | :--- | :--- |
| `User_Id` | SERIAL | Primary Key |
| `Work_Email` | VARCHAR | Unique Identifier |
| `Password` | VARCHAR | Hashed Password |
| `Role` | VARCHAR | User category (Admin/Employee/etc) |
| `First_Name` | VARCHAR | |
| `Last_Name` | VARCHAR | |
| `Mobile_Number`| VARCHAR | |
---

## Delegation Endpoints

### 1. Create Delegation
Assign a task to a doer.

- **URL**: `/api/delegations`
- **Method**: `POST`
- **Access**: Private (Admin/SuperAdmin/Employee)
- **Headers**: `Authorization: Bearer <your_token>`

#### Request Body
```json
{
  "delegation_name": "Quarterly Audit",
  "description": "Perform internal audit of inventory",
  "delegator_id": 1,
  "delegator_name": "Admin Name",
  "doer_id": 5,
  "doer_name": "john.doe@enterprise.com",
  "department": "Finance",
  "priority": "high",
  "due_date": "2024-03-31",
  "evidence_required": true
}
```

---

### 2. List Delegations
Fetch delegations based on role.

- **URL**: `/api/delegations`
- **Method**: `GET`
- **Access**: Private
- **Headers**: `Authorization: Bearer <your_token>`

> [!NOTE]
> - **Admins/SuperAdmins** will see all delegations.
> - **Employees/Doers** will see only tasks assigned to them.

---

### 3. Add Remark
Add a comment or update to a delegation.

- **URL**: `/api/delegations/:id/remarks`
- **Method**: `POST`
- **Access**: Private
- **Headers**: `Authorization: Bearer <your_token>`

#### Request Body
```json
{
  "remark": "Audit is 50% complete. Found some discrepancies in warehouse B."
}
```

---

### 4. Get Delegation Detail
Fetch full details including remarks and history.

- **URL**: `/api/delegations/:id`
- **Method**: `GET`
- **Access**: Private
- **Headers**: `Authorization: Bearer <your_token>`

---

## Checklist Management Endpoints

### 1. Create Checklist Template (Master)
Define a recurring task template.

- **URL**: `/api/checklist/master`
- **Method**: `POST`
- **Access**: Private
- **Headers**: `Authorization: Bearer <your_token>`

#### Request Body
```json
{
  "question": "Daily Server Health Check",
  "assignee_id": 1,
  "doer_id": 2,
  "priority": "high",
  "department": "IT",
  "verification_required": true,
  "verifier_id": 1,
  "attachment_required": false,
  "frequency": "daily",
  "from_date": "2024-01-01",
  "due_date": "2024-12-31",
  "weekly_days": ["Monday", "Wednesday", "Friday"],
  "selected_dates": [1, 15]
}
```

> [!NOTE]
> - `frequency` can be: `daily`, `weekly`, `monthly`, `custom`.
> - `weekly_days` is only used if frequency is `weekly`.
> - `selected_dates` is only used if frequency is `monthly`.

---

### 2. Update Checklist Template
Update the details of an existing master template.

- **URL**: `/api/checklist/master/:id`
- **Method**: `PUT`
- **Access**: Private

---

### 3. Delete Checklist Template
Remove a master template. This will also delete all generated task instances.

- **URL**: `/api/checklist/master/:id`
- **Method**: `DELETE`
- **Access**: Private

---

### 4. Update Task Status
Update the status of a specific generated task instance.

- **URL**: `/api/checklist/task/:id`
- **Method**: `PATCH`
- **Access**: Private

#### Request Body
```json
{
  "status": "Completed"
}
```

> [!NOTE]
> Allowed status values: `Pending`, `In Progress`, `Completed`, `Verified`.

---

### 5. Delete Task Instance
Remove a specific task instance from the system.

- **URL**: `/api/checklist/task/:id`
- **Method**: `DELETE`
- **Access**: Private

---

## Help Ticket Management Endpoints (FMS Workflow)

### 1. Stage 1: Raise Help Ticket
Raise a new ticket with issue details and optional image.

- **URL**: `/api/help-tickets/raise`
- **Method**: `POST`
- **Headers**: `Content-Type: multipart/form-data`
- **Access**: Private

#### Form Data Fields:
- `location`: string
- `issue_description`: text
- `pc_accountable`: integer (User_Id)
- `desired_date`: datetime-local string
- `priority`: string ('low', 'medium', 'high', 'critical')
- `image_upload`: File (optional image)

---

### 2. Stage 2: PC Planning
Process Controller assigns a solver and sets planned dates.

- **URL**: `/api/help-tickets/pc-planning/:id`
- **Method**: `PUT`
- **Access**: Private

#### Request Body
```json
{
  "pc_planned_date": "2026-02-01T10:00:00Z",
  "problem_solver": 3,
  "pc_remark": "Assigned to IT team for hardware check."
}
```

---

### 3. Stage 3: Solver Action
Solver can either solve the ticket or revise the planned date.

#### Solve Ticket (Confirm Solution)
- **URL**: `/api/help-tickets/solve/:id`
- **Method**: `PUT`
- **Headers**: `Content-Type: multipart/form-data`
- **Access**: Private
- **Body Fields**:
  - `solver_remark`: string
  - `proof_upload`: File (optional proof image)

#### Revise Date
- **URL**: `/api/help-tickets/revise/:id`
- **Method**: `PUT`
- **Access**: Private
- **Body**: `{ "solver_planned_date": "...", "solver_remark": "..." }`

---

### 4. Stage 4: PC Confirmation
PC confirms the solution provided by the solver.

- **URL**: `/api/help-tickets/pc-confirm/:id`
- **Method**: `PUT`
- **Access**: Private

#### Request Body
```json
{
  "pc_status_stage4": "CONFIRMED",
  "pc_remark_stage4": "Solution verified and working."
}
```

---

### 5. Stage 5: Closure / Re-raise
User (Raiser) can close the ticket with a rating or re-raise if unsatisfied.

#### Close Ticket
- **URL**: `/api/help-tickets/close/:id`
- **Method**: `PUT`
- **Body**: `{ "closing_rating": 5, "closing_status": "SUCCESS", "remarks": "Very helpful!" }`

#### Re-raise Ticket
- **URL**: `/api/help-tickets/reraise/:id`
- **Method**: `PUT`
- **Body**: `{ "remarks": "The issue persisted after 2 days." }`

---

### 6. Get Ticket Detail with History
Fetch full detail including the history of revisions and stage changes.

- **URL**: `/api/help-tickets/:id`
- **Method**: `GET`
- **Access**: Private

---

## Help Ticket Configuration Endpoints

### 1. Get Configuration
Fetch the current help ticket configuration settings and all upcoming holidays.

- **URL**: `/api/help-ticket-config`
- **Method**: `GET`
- **Access**: Private (JWT Required)
- **Headers**: `Authorization: Bearer <your_token>`

#### Success Response
**Code**: `200 OK`
```json
{
  "settings": {
    "id": 1,
    "stage2_tat_hours": 24,
    "stage4_tat_hours": 48,
    "stage5_tat_hours": 72,
    "office_start_time": "09:00:00",
    "office_end_time": "18:00:00",
    "working_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  },
  "holidays": [
    {
      "id": 1,
      "holiday_date": "2026-02-14",
      "description": "Valentine's Day",
      "created_at": "2024-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "holiday_date": "2026-03-08",
      "description": "International Women's Day",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### Error Response
**Code**: `404 Not Found`
```json
{
  "message": "Configuration not found"
}
```

---

### 2. Update Configuration
Update help ticket workflow settings like TAT (Turn-Around Time) hours, office hours, and working days.

- **URL**: `/api/help-ticket-config`
- **Method**: `PUT`
- **Access**: Private (JWT Required)
- **Headers**: `Authorization: Bearer <your_token>`

#### Request Body
```json
{
  "stage2_tat_hours": 24,
  "stage4_tat_hours": 48,
  "stage5_tat_hours": 72,
  "office_start_time": "09:00:00",
  "office_end_time": "18:00:00",
  "working_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
}
```

> [!NOTE]
> - `stage2_tat_hours`: Turn-Around Time for PC Planning stage (in hours)
> - `stage4_tat_hours`: Turn-Around Time for PC Confirmation stage (in hours)
> - `stage5_tat_hours`: Turn-Around Time for Closure/Re-raise stage (in hours)
> - `office_start_time` and `office_end_time`: Working hours in HH:MM:SS format
> - `working_days`: Array of weekday names (e.g., ["Monday", "Tuesday", ...])

#### Success Response
**Code**: `200 OK`
```json
{
  "id": 1,
  "stage2_tat_hours": 24,
  "stage4_tat_hours": 48,
  "stage5_tat_hours": 72,
  "office_start_time": "09:00:00",
  "office_end_time": "18:00:00",
  "working_days": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2026-01-22T15:45:30Z"
}
```

---

### 3. Add Holiday
Add a new holiday date to the system.

- **URL**: `/api/help-ticket-config/holidays`
- **Method**: `POST`
- **Access**: Private (JWT Required)
- **Headers**: `Authorization: Bearer <your_token>`

#### Request Body
```json
{
  "holiday_date": "2026-03-08",
  "description": "International Women's Day"
}
```

#### Success Response
**Code**: `201 Created`
```json
{
  "id": 3,
  "holiday_date": "2026-03-08",
  "description": "International Women's Day",
  "created_at": "2026-01-22T15:50:00Z"
}
```

#### Error Response
**Code**: `400 Bad Request` (Holiday already exists for this date)
```json
{
  "message": "Holiday already exists for this date"
}
```

---

### 4. Remove Holiday
Delete a holiday from the system.

- **URL**: `/api/help-ticket-config/holidays/:id`
- **Method**: `DELETE`
- **Access**: Private (JWT Required)
- **Headers**: `Authorization: Bearer <your_token>`

#### Path Parameter
- `id`: The ID of the holiday to remove (integer)

#### Success Response
**Code**: `200 OK`
```json
{
  "message": "Holiday removed"
}
```

#### Error Response
**Code**: `500 Internal Server Error`
```json
{
  "message": "Error removing holiday"
}
```
