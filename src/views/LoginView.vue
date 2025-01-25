<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-body">
            <h2 class="text-center mb-4">{{ isLogin ? 'Iniciar Sesión' : 'Registro' }}</h2>

            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label">Usuario</label>
                <input type="text" class="form-control" v-model="username" required>
              </div>

              <div class="mb-3">
                <label class="form-label">Contraseña</label>
                <input type="password" class="form-control" v-model="password" required>
              </div>

              <button type="submit" class="btn btn-primary w-100">
                {{ isLogin ? 'Iniciar Sesión' : 'Registrarse' }}
              </button>

              <p class="text-center mt-3">
                <a href="#" @click.prevent="toggleMode">
                  {{ isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión' }}
                </a>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      isLogin: true,
      username: '',
      password: ''
    }
  },
  methods: {
    toggleMode() {
      this.isLogin = !this.isLogin;
    },
    handleSubmit() {
      if (this.isLogin) {
        this.login();
      } else {
        this.register();
      }
    },
    login() {
      const users = JSON.parse(localStorage.getItem('users')) || {};
      if (users[this.username] === this.password) {
        localStorage.setItem('currentUser', this.username);
        this.$router.push('/');
      } else {
        alert('Usuario o contraseña incorrectos');
      }
    },
    register() {
      const users = JSON.parse(localStorage.getItem('users')) || {};
      if (users[this.username]) {
        alert('El usuario ya existe');
        return;
      }
      users[this.username] = this.password;
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', this.username);
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.card {
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
</style>
