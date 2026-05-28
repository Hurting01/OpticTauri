// EmployeesService - HTTP клиент для работы с сотрудниками через REST API
// Base URL: http://localhost:5000/api

const API_BASE_URL = 'http://localhost:5000/api';

const EmployeesService = {
  // GET /api/employees?activeOnly=true
  async getEmployees(activeOnly = false) {
    try {
      let url = `${API_BASE_URL}/employees`;
      if (activeOnly) {
        url += '?activeOnly=true';
      }
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Failed to fetch employees:', response.status);
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching employees:', error);
      return [];
    }
  },

  // GET /api/employees/{id}
  async getEmployeeById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`);
      if (!response.ok) {
        console.error('Failed to fetch employee:', response.status);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching employee:', error);
      return null;
    }
  },

  // POST /api/employees
  async createEmployee(employeeData) {
    try {
      const response = await fetch(`${API_BASE_URL}/employees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
      });
      if (!response.ok) {
        console.error('Failed to create employee:', response.status);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating employee:', error);
      return null;
    }
  },

  // PUT /api/employees/{id}
  async updateEmployee(id, employeeData) {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(employeeData)
      });
      if (!response.ok) {
        console.error('Failed to update employee:', response.status);
        return false;
      }
      return await response.json(); // возвращает true
    } catch (error) {
      console.error('Error updating employee:', error);
      return false;
    }
  },

  // DELETE /api/employees/{id}
  async deleteEmployee(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        console.error('Failed to delete employee:', response.status);
        return false;
      }
      return await response.json(); // возвращает true
    } catch (error) {
      console.error('Error deleting employee:', error);
      return false;
    }
  }
};

export default EmployeesService;
