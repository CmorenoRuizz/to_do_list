<template>
  <div>
    <button class="btn btn-info toggle-aside" @click="toggleAside" v-if="!asideOpen">☰</button>
    <aside :class="{ 'aside-open': asideOpen }" @click.self="toggleAside">
      <div class="aside-header d-flex align-items-center justify-content-between p-3">
        <div class="d-flex align-items-center">
          <img src="/images/user.png" alt="User Photo" class="user-photo me-2" />
          <h5 class="user-name mb-0">Nombre del Usuario</h5>
        </div>
        <button class="btn btn-danger close-aside" @click="toggleAside">✖</button>
      </div>
      <ul class="list-group list-group-flush flex-grow-1">
        <li class="list-group-item">
          <a href="#" class="d-flex align-items-center">
            <i class="bi bi-gear me-2"></i> Configuración
          </a>
        </li>
      </ul>
      <div class="aside-footer p-3">
        <button class="btn btn-danger w-100" @click="cerrarSesion">Cerrar Sesión</button>
      </div>
    </aside>
  </div>
</template>

<script>
export default {
  name: "AsideMenu",
  data() {
    return {
      asideOpen: false,
    };
  },
  methods: {
    toggleAside() {
      this.asideOpen = !this.asideOpen;
    },
    cerrarSesion() {
      console.log("Cerrar Sesión");
    },
  },
};
</script>

<style>
.toggle-aside {
  position: fixed;
  top: 10px;
  left: 10px;
  z-index: 1000;
  transition: transform 0.3s ease;
}

.aside-open .toggle-aside {
  transform: translateX(-250px);
}

aside {
  position: fixed;
  top: 0;
  left: -250px;
  width: 250px;
  height: 100%;
  background-color: #f8f9fa;
  color: #000;
  transition: left 0.3s ease;
  padding: 0;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  z-index: 999;
  display: flex;
  flex-direction: column;
}

.aside-open {
  left: 0;
}

body.bg-dark aside {
  background-color: #343a40;
  color: #fff;
}

.aside-header {
  background-color: #e9ecef;
}

body.bg-dark .aside-header {
  background-color: #495057;
}

.user-photo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.close-aside {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.list-group-item {
  background-color: transparent;
  border: none;
}

.menu-img {
  width: 20px;
  height: 20px;
}

.aside-footer {
  background-color: #e9ecef;
}

body.bg-dark .aside-footer {
  background-color: #495057;
}
</style>
