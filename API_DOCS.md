# 📚 API DOCUMENTATION - Rescue 1122 HRM

Complete REST API documentation for the Rescue 1122 HRM system.

---

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Base URL & Headers](#base-url--headers)
3. [Response Format](#response-format)
4. [Authentication Endpoints](#authentication-endpoints)
5. [Employee Endpoints](#employee-endpoints)
6. [Attendance Endpoints](#attendance-endpoints)
7. [Payroll Endpoints](#payroll-endpoints)
8. [Leave Endpoints](#leave-endpoints)
9. [Transfer Endpoints](#transfer-endpoints)
10. [Field Management](#field-management)
11. [Error Handling](#error-handling)
12. [Rate Limiting](#rate-limiting)
13. [Examples](#examples)

---

## 🔐 Authentication

All API requests (except login) require a **Bearer Token** obtained after login.

### Token Storage
```javascript
// Token is stored in localStorage
const token = localStorage.getItem('hrm_token');

// Include in all requests
headers: {
  'Authorization': `Bearer ${token}`
}
```

### Token Expiration
Tokens expire after **24 hours**. After expiration, user is redirected to login page.

---

## 🌐 Base URL & Headers

### Base URL
```
http://127.0.0.1:8000/api          (Local Development)
https://your-domain.com/api        (Production)
```

### Required Headers
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer <your-token>
X-Requested-With: XMLHttpRequest
```

### Example Request
```bash
curl -X GET "http://127.0.0.1:8000/api/employees" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc..."
```

---

## 📤 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "error_code",
  "message": "Human-readable error message",
  "errors": {
    "email": ["Email field is required"]
  }
}
```

### List Response
```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "Employee 1" },
    { "id": 2, "name": "Employee 2" }
  ],
  "pagination": {
    "total": 100,
    "count": 15,
    "per_page": 15,
    "current_page": 1,
    "last_page": 7
  }
}
```

---

## 🔑 Authentication Endpoints

### POST /api/login

Login to the system and receive access token.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "expiresIn": 86400,
  "user": {
    "id": 1,
    "name": "Administrator",
    "username": "admin",
    "email": "admin@rescue1122.com",
    "role": "admin"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "invalid_credentials",
  "message": "Invalid username or password"
}
```

**JavaScript Example:**
```javascript
async function login() {
  const response = await api.post('login', {
    username: 'admin',
    password: 'admin123'
  });
  
  const data = await response.json();
  
  if (data.success) {
    Auth.setToken(data.token, data.expiresIn);
    Auth.setUser(data.user);
    window.location.href = 'admin.html';
  } else {
    alert('Login failed: ' + data.message);
  }
}
```

---

### POST /api/logout

Logout and invalidate token.

**Request:**
```bash
POST /api/logout HTTP/1.1
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**JavaScript Example:**
```javascript
async function logout() {
  await api.post('logout');
  Auth.clearToken();
  window.location.href = 'index.html';
}
```

---

### GET /api/me

Get current logged-in user info.

**Request:**
```bash
GET /api/me HTTP/1.1
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Administrator",
    "username": "admin",
    "email": "admin@rescue1122.com",
    "role": "admin",
    "created_at": "2026-01-01T10:00:00Z"
  }
}
```

---

## 👥 Employee Endpoints

### GET /api/employees

Get all employees with pagination.

**Query Parameters:**
- `page` (integer) - Page number (default: 1)
- `per_page` (integer) - Records per page (default: 15)
- `search` (string) - Search by name or email
- `department` (string) - Filter by department
- `designation` (string) - Filter by designation
- `status` (string) - Filter by status (active, inactive, on_leave)

**Request:**
```bash
GET /api/employees?page=1&per_page=15&search=john HTTP/1.1
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "03001234567",
      "designation": "Senior Officer",
      "department": "Operations",
      "status": "active",
      "date_of_joining": "2020-01-15",
      "photo_url": "https://domain.com/storage/uploads/1.jpg"
    }
  ],
  "pagination": {
    "total": 45,
    "count": 15,
    "per_page": 15,
    "current_page": 1,
    "last_page": 3
  }
}
```

**JavaScript Example:**
```javascript
async function getEmployees(page = 1, search = '') {
  const response = await api.get('employees', { 
    page, 
    search,
    per_page: 15 
  });
  
  const data = await response.json();
  
  if (data.success) {
    displayEmployees(data.data);
    updatePagination(data.pagination);
  }
}
```

---

### GET /api/employees/{id}

Get single employee details.

**Request:**
```bash
GET /api/employees/1 HTTP/1.1
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "03001234567",
    "designation": "Senior Officer",
    "department": "Operations",
    "status": "active",
    "date_of_joining": "2020-01-15",
    "salary": 50000,
    "nic": "1234567890123",
    "address": "123 Main St",
    "city": "Karachi",
    "province": "Sindh",
    "photo_url": "https://domain.com/storage/uploads/1.jpg",
    "created_at": "2026-01-01T10:00:00Z",
    "updated_at": "2026-05-24T15:30:00Z"
  }
}
```

---

### POST /api/employees

Create new employee.

**Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "03009876543",
  "designation": "Officer",
  "department": "Operations",
  "date_of_joining": "2026-06-01",
  "salary": 45000,
  "nic": "9876543210987",
  "address": "456 Oak Ave",
  "city": "Islamabad",
  "province": "Federal",
  "status": "active"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": {
    "id": 45,
    "name": "Jane Smith",
    "email": "jane@example.com"
  }
}
```

**Error Response (422):**
```json
{
  "success": false,
  "error": "validation_error",
  "message": "The given data was invalid",
  "errors": {
    "email": ["The email has already been taken"],
    "phone": ["The phone field is required"]
  }
}
```

**JavaScript Example:**
```javascript
async function createEmployee(formData) {
  const response = await api.post('employees', {
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    designation: formData.designation,
    department: formData.department,
    date_of_joining: formData.date_of_joining,
    salary: parseFloat(formData.salary)
  });
  
  const data = await response.json();
  
  if (data.success) {
    alert('Employee created successfully');
    window.location.href = 'employee_list.html';
  } else {
    displayValidationErrors(data.errors);
  }
}
```

---

### PUT /api/employees/{id}

Update employee.

**Request:**
```json
{
  "name": "Jane Smith Updated",
  "designation": "Senior Officer",
  "salary": 55000
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Employee updated successfully",
  "data": {
    "id": 45,
    "name": "Jane Smith Updated"
  }
}
```

---

### DELETE /api/employees/{id}

Delete employee (soft delete).

**Request:**
```bash
DELETE /api/employees/45 HTTP/1.1
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

---

### POST /api/employees/{id}/photo

Upload employee photo.

**Request:**
```bash
POST /api/employees/1/photo HTTP/1.1
Authorization: Bearer {token}
Content-Type: multipart/form-data

file: <binary_image_data>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Photo uploaded successfully",
  "data": {
    "photo_url": "https://domain.com/storage/uploads/1.jpg"
  }
}
```

**JavaScript Example:**
```javascript
async function uploadPhoto(employeeId, file) {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.upload(`employees/${employeeId}/photo`, formData);
  const data = await response.json();
  
  if (data.success) {
    console.log('Photo uploaded:', data.data.photo_url);
  }
}
```

---

## 📅 Attendance Endpoints

### POST /api/attendance

Record attendance.

**Request:**
```json
{
  "employee_id": 1,
  "date": "2026-05-24",
  "status": "present",
  "remarks": "On time"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Attendance recorded",
  "data": {
    "id": 1,
    "employee_id": 1,
    "date": "2026-05-24",
    "status": "present"
  }
}
```

---

### GET /api/attendance

Get attendance records.

**Query Parameters:**
- `employee_id` (integer)
- `month` (integer) - Month (1-12)
- `year` (integer) - Year (e.g., 2026)
- `page` (integer)

**Request:**
```bash
GET /api/attendance?employee_id=1&month=5&year=2026 HTTP/1.1
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employee_id": 1,
      "date": "2026-05-01",
      "status": "present",
      "remarks": "On time"
    }
  ]
}
```

---

## 💰 Payroll Endpoints

### GET /api/payroll

Get payroll records.

**Query Parameters:**
- `employee_id` (integer)
- `month` (integer)
- `year` (integer)

**Request:**
```bash
GET /api/payroll?employee_id=1&month=5&year=2026 HTTP/1.1
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employee_id": 1,
      "month": 5,
      "year": 2026,
      "basic_salary": 50000,
      "allowances": 5000,
      "deductions": 2000,
      "net_salary": 53000,
      "status": "processed"
    }
  ]
}
```

---

### POST /api/payroll/generate

Generate payroll for all employees.

**Request:**
```json
{
  "month": 5,
  "year": 2026
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Payroll generated successfully",
  "data": {
    "total_employees": 50,
    "total_amount": 2500000
  }
}
```

---

## 🏢 Transfer Endpoints

### GET /api/transfers

Get transfer/posting records.

**Request:**
```bash
GET /api/transfers HTTP/1.1
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employee_id": 1,
      "from_department": "Operations",
      "to_department": "HR",
      "transfer_date": "2026-05-15",
      "reason": "Promotion"
    }
  ]
}
```

---

### POST /api/transfers

Create new transfer.

**Request:**
```json
{
  "employee_id": 1,
  "from_department": "Operations",
  "to_department": "HR",
  "transfer_date": "2026-06-01",
  "reason": "Promotion"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Transfer recorded successfully"
}
```

---

## 🏷️ Field Management

### GET /api/fields

Get custom fields.

**Request:**
```bash
GET /api/fields HTTP/1.1
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "designation",
      "type": "dropdown",
      "values": ["Officer", "Senior Officer", "Manager"]
    }
  ]
}
```

---

### POST /api/fields

Create custom field.

**Request:**
```json
{
  "name": "qualification",
  "type": "dropdown",
  "values": ["Bachelor", "Master", "PhD"]
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Field created successfully"
}
```

---

## ⚠️ Error Handling

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid parameters |
| 401 | Unauthorized | Token missing/invalid |
| 403 | Forbidden | No permission |
| 404 | Not Found | Resource not found |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal error |

### Error Response Format

```json
{
  "success": false,
  "error": "error_code",
  "message": "Human-readable message",
  "status_code": 400
}
```

### Validation Errors

```json
{
  "success": false,
  "error": "validation_error",
  "message": "The given data was invalid",
  "errors": {
    "email": [
      "The email field is required",
      "The email must be a valid email address"
    ],
    "phone": ["The phone field is required"]
  }
}
```

---

## 🚦 Rate Limiting

### Limits
- **Login:** 5 requests per minute
- **General API:** 60 requests per minute
- **File Upload:** 10 requests per minute

### Rate Limit Headers
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1653384000
```

### Exceeding Limit
```json
{
  "success": false,
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please try again later.",
  "retry_after": 60
}
```

---

## 💡 Examples

### Complete Login & Fetch Data Example

```javascript
// 1. Login
async function loginAndFetch() {
  try {
    // Login
    const loginRes = await api.post('login', {
      username: 'admin',
      password: 'admin123'
    });
    
    const loginData = await loginRes.json();
    
    if (!loginData.success) {
      throw new Error(loginData.message);
    }
    
    // Save token
    Auth.setToken(loginData.token, loginData.expiresIn);
    Auth.setUser(loginData.user);
    
    // 2. Fetch employees
    const empRes = await api.get('employees', { page: 1 });
    const empData = await empRes.json();
    
    if (empData.success) {
      console.log('Employees:', empData.data);
      displayEmployees(empData.data);
    }
    
  } catch (error) {
    console.error('Error:', error.message);
    alert('Error: ' + error.message);
  }
}

// 3. Display employees
function displayEmployees(employees) {
  const table = document.getElementById('employeeTable');
  table.innerHTML = employees.map(emp => `
    <tr>
      <td>${emp.name}</td>
      <td>${emp.email}</td>
      <td>${emp.designation}</td>
      <td>${emp.department}</td>
    </tr>
  `).join('');
}
```

### Form Submission with Error Handling

```javascript
async function handleSubmit(event) {
  event.preventDefault();
  
  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    designation: document.getElementById('designation').value
  };
  
  try {
    const response = await api.post('employees', formData);
    const data = await response.json();
    
    if (data.success) {
      showAlert('success', 'Employee created successfully');
      setTimeout(() => window.location.href = 'employee_list.html', 1500);
    } else if (data.errors) {
      // Display validation errors
      Object.entries(data.errors).forEach(([field, messages]) => {
        const input = document.getElementById(field);
        if (input) {
          input.classList.add('error');
          input.title = messages.join(', ');
        }
      });
    }
  } catch (error) {
    showAlert('error', 'Failed to create employee: ' + error.message);
  }
}
```

---

## 📚 API Testing Tools

- **Postman:** https://www.postman.com/
- **Insomnia:** https://insomnia.rest/
- **Thunder Client:** https://www.thunderclient.com/
- **curl:** Command line tool (built-in)

---

## 🔗 Related Documentation

- [README.md](README.md) - Project overview
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Local setup
- [DEPLOYMENT.md](DEPLOYMENT.md) - Production deployment

---

*Last Updated: May 24, 2026*
*For API changes, see CHANGELOG.md*
