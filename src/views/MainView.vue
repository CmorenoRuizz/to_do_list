<template>
  <div>
    <h1>Bienvenido</h1>
    <div v-if="showLogin">
      <h2>Iniciar Sesión</h2>
      <form @submit.prevent="login">
        <input v-model="loginData.username" placeholder="Usuario" required />
        <input v-model="loginData.password" type="password" placeholder="Contraseña" required />
        <button type="submit">Iniciar Sesión</button>
      </form>
      <button @click="toggleView">Crear Cuenta</button>
    </div>
    <div v-else>
      <h2>Crear Cuenta</h2>
      <form @submit.prevent="createAccount">
        <input v-model="registerData.username" placeholder="Usuario" required />
        <input v-model="registerData.password" type="password" placeholder="Contraseña" required />
        <button type="submit">Crear Cuenta</button>
      </form>
      <button @click="toggleView">Iniciar Sesión</button>
    </div>
  </div>
</template>

<script>
import { useUserStore } from '@/stores/userStore';

export default {
  name: 'MainView',
  data() {
    return {
      showLogin: true,
      loginData: {
        username: '',
        password: ''
      },
      registerData: {
        username: '',
        password: ''
      },
      loginError: false,
      registerError: false,
      registerAttempts: 0
    };
  },
  methods: {
    toggleView() {
      this.showLogin = !this.showLogin;
    },
    async login() {
      const userStore = useUserStore();
      this.loginError = false;
      try {
        const response = await userStore.login(this.loginData);
        if (response.success) {
          this.$router.push('/dashboard');
        } else {
          this.loginError = true;
          alert('Usuario o contraseña incorrectos');
        }
      } catch (error) {
        this.loginError = true;
        alert('Error al iniciar sesión');
      }
    },
    async createAccount() {
      const userStore = useUserStore();
      this.registerError = false;
      this.registerAttempts++;
      if (this.registerAttempts > 3) {
        alert('Demasiados intentos fallidos. Por favor, inténtelo más tarde.');
        return;
      }
      try {
        const response = await userStore.createAccount(this.registerData);
        if (response.success) {
          alert('Cuenta creada exitosamente');
          this.toggleView();
        } else {
          this.registerError = true;
          alert(response.message || 'Error al crear la cuenta');
        }
      } catch (error) {
        this.registerError = true;
        alert('Error al crear la cuenta');
      }
    }
  }
};
</script>

<style scoped>
/* Estilos opcionales */
</style>
