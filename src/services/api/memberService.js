import api from './api';

const memberService = {
  // Get all members
  async getMembers() {
    try {
      const response = await api.get('/api/members');
      return response.data;
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  },

  // Get a single member by ID
  async getMemberById(id) {
    try {
      const response = await api.get(`/api/members/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching member with ID ${id}:`, error);
      throw error;
    }
  },

  // Create a new member
  async createMember(memberData) {
    try {
      const response = await api.post('/api/members', memberData);
      return response.data;
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  },

  // Update a member
  async updateMember(id, memberData) {
    try {
      const response = await api.put(`/api/members/${id}`, memberData);
      return response.data;
    } catch (error) {
      console.error(`Error updating member with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete a member
  async deleteMember(id) {
    try {
      const response = await api.delete(`/api/members/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting member with ID ${id}:`, error);
      throw error;
    }
  },

  // Get members with expiring memberships
  async getExpiringMemberships(days = 30) {
    try {
      const response = await api.get('/api/members/expiring', { params: { days } });
      return response.data;
    } catch (error) {
      console.error('Error fetching expiring memberships:', error);
      throw error;
    }
  },

  // Update member's membership
  async updateMembership(memberId, membershipData) {
    try {
      const response = await api.put(`/api/members/${memberId}/membership`, membershipData);
      return response.data;
    } catch (error) {
      console.error(`Error updating membership for member ${memberId}:`, error);
      throw error;
    }
  },

  // Search members
  async searchMembers(query) {
    try {
      const response = await api.get('/api/members/search', { params: { q: query } });
      return response.data;
    } catch (error) {
      console.error('Error searching members:', error);
      throw error;
    }
  }
};

export default memberService;
