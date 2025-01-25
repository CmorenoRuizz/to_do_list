import { defineStore } from 'pinia';
import axios from 'axios';

export const useUserStore = defineStore('user', {
  state: () => ({
    isLoggedIn: false,
    user: null,
  }),
  actions: {
    async login(loginData) {
      try {
        const response = await axios.post('/api/login', loginData);
        if (response.data.success) {
          this.isLoggedIn = true;
          this.user = response.data.user;
          sessionStorage.setItem('user', JSON.stringify(this.user));
        }
        return response.data;
      } catch (error) {
        console.error('Error during login:', error);
        throw error;
      }
    },
    async createAccount(registerData) {
      try {
        const response = await axios.post('/api/register', registerData);
        if (response.data.success) {
          return response.data;
        } else {
          throw new Error(response.data.message || 'Error al crear la cuenta');
        }
      } catch (error) {
        console.error('Error during account creation:', error);
        throw error;
      }
    },
    logout() {
      this.isLoggedIn = false;
      this.user = null;
      sessionStorage.removeItem('user');
    },
    loadSession() {
      const user = sessionStorage.getItem('user');
      if (user) {
        this.isLoggedIn = true;
        this.user = JSON.parse(user);
      }
    }
  }
});
