import api from './api';

const attendanceService = {
  // Record member attendance
  async recordAttendance(attendanceData) {
    try {
      const response = await api.post('/api/attendance', attendanceData);
      return response.data;
    } catch (error) {
      console.error('Error recording attendance:', error);
      throw error;
    }
  },

  // Get attendance for a specific date
  async getAttendanceByDate(date) {
    try {
      const response = await api.get('/api/attendance', { params: { date } });
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance for date ${date}:`, error);
      throw error;
    }
  },

  // Get member's attendance history
  async getMemberAttendance(memberId, params = {}) {
    try {
      const response = await api.get(`/api/members/${memberId}/attendance`, { params });
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance for member ${memberId}:`, error);
      throw error;
    }
  },

  // Get attendance statistics
  async getAttendanceStats(params = {}) {
    try {
      const response = await api.get('/api/attendance/stats', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance statistics:', error);
      throw error;
    }
  },

  // Get attendance summary for a period
  async getAttendanceSummary(startDate, endDate) {
    try {
      const response = await api.get('/api/attendance/summary', { 
        params: { startDate, endDate } 
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      throw error;
    }
  },

  // Get class attendance
  async getClassAttendance(classId, date) {
    try {
      const response = await api.get(`/api/classes/${classId}/attendance`, { 
        params: { date } 
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching attendance for class ${classId}:`, error);
      throw error;
    }
  },

  // Update attendance record
  async updateAttendance(attendanceId, updates) {
    try {
      const response = await api.put(`/api/attendance/${attendanceId}`, updates);
      return response.data;
    } catch (error) {
      console.error(`Error updating attendance record ${attendanceId}:`, error);
      throw error;
    }
  },

  // Delete attendance record
  async deleteAttendance(attendanceId) {
    try {
      const response = await api.delete(`/api/attendance/${attendanceId}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting attendance record ${attendanceId}:`, error);
      throw error;
    }
  }
};

export default attendanceService;
