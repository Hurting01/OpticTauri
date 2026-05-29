const API_BASE_URL = 'http://localhost:5000/api';

const PositionsService = {
  async getPositions() {
    try {
      const response = await fetch(`${API_BASE_URL}/positions`);
      if (!response.ok) {
        console.error('Failed to fetch positions:', response.status);
        return [];
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching positions:', error);
      return [];
    }
  },

  async createPosition(name) {
    try {
      const response = await fetch(`${API_BASE_URL}/positions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (!response.ok) {
        console.error('Failed to create position:', response.status);
        return null;
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating position:', error);
      return null;
    }
  },

  async deletePosition(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/positions/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        console.error('Failed to delete position:', response.status);
        return false;
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting position:', error);
      return false;
    }
  }
};

export default PositionsService;