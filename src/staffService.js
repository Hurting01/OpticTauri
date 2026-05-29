const API_BASE_URL = 'http://localhost:5000/api';

const StaffService = {
  async getStaff() {
    try {
      const response = await fetch(`${API_BASE_URL}/staff`);
      if (!response.ok) {
        console.error('Failed to fetch staff:', response.status);
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching staff:', error);
      return [];
    }
  },

  async createStaff(fullName, positionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/staff`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, position_id: positionId })
      });
      if (!response.ok) {
        console.error('Failed to create staff:', response.status);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating staff:', error);
      return null;
    }
  },

  async deleteStaff(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/staff/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        console.error('Failed to delete staff:', response.status);
        return false;
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting staff:', error);
      return false;
    }
  }
};

export default StaffService;