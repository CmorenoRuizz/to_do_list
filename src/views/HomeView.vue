<template>
  <!-- Navbar modificado -->
  <nav class="navbar navbar-expand-lg navbar-slim" :class="modoOscuro ? 'navbar-dark bg-dark' : 'navbar-light bg-light'">
    <div class="container">
      <span class="navbar-brand mt-2">ToDo List</span>
      <div class="d-flex gap-2">
        <button class="btn btn-success mt-2" type="button">
          Login
        </button>
        <button class="btn mt-2"
          :class="modoOscuro ? 'btn-light text-dark' : 'btn-dark text-white'"
          @click="toggleDarkMode">
          {{ modoOscuro ? "Modo Claro" : "Modo Oscuro" }}
        </button>
      </div>
    </div>
  </nav>

  <div class="container mt-5">
    <h1 class="text-center mb-4">Lista de tareas pendientes</h1>

    <div class="d-flex justify-content-center gap-2 mb-3">
      <!-- Eliminado el botón de modo oscuro de aquí -->
      <button class="btn btn-primary" @click="toggleFormulario">
        {{ mostrarFormulario ? "Ocultar formulario" : "Nueva tarea" }}
      </button>
    </div>

    <!-- Filtro de prioridades -->
    <div :class="{ hidden: mostrarFormulario }" class="mb-4 d-flex justify-content-center">
      <div style="max-width: 600px; width: 100%;">
        <multiselect v-model="filtroPrioridades" :options="opcionesPrioridad" :multiple="true"
          placeholder="Filtrar por prioridad" />
      </div>
    </div>

    <!-- Formulario para agregar tareas con animación -->
    <transition name="slide">
      <div v-if="mostrarFormulario" class="mb-4 d-flex justify-content-center">
        <div style="max-width: 600px; width: 100%;">
          <div class="input-group mb-2">
            <input type="text" class="form-control" placeholder="Nombre de la tarea" v-model="nuevaTarea.texto" />
          </div>
          <div class="input-group mb-2">
            <input type="date" class="form-control" v-model="nuevaTarea.fecha" />
          </div>
          <div class="input-group mb-2">
            <input type="time" class="form-control" v-model="nuevaTarea.hora" />
          </div>
          <div class="input-group mb-3">
            <select class="form-select" v-model="nuevaTarea.prioridad">
              <option value="" disabled>Selecciona una prioridad</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
              <option value="Baja">Baja</option>
            </select>
          </div>
          <button class="btn btn-success w-100" @click="agregarTarea">Agregar Tarea</button>
        </div>
      </div>
    </transition>

    <!-- Tres columnas -->
    <div class="row">
      <div class="col-md-4" v-for="columna in ['Por hacer', 'En proceso', 'Completado']" :key="columna">
        <h3 class="text-center">
          {{ columna }} <span class="badge bg-secondary">{{ tareasFiltradasPorColumna[columna].length }}</span>
        </h3>
        <div class="p-3 bg-light border position-relative" @dragover.prevent="permitirArrastre"
          @drop="moverTarea(columna)">
          <!-- Texto "Arrastrar aquí" -->
          <div v-if="tareaArrastrada && tareaArrastrada.columna !== columna"
            class="p-3 text-center text-muted border border-primary rounded mb-2"
            style="height: 80px; display: flex; align-items: center; justify-content: center;">
            Arrastrar aquí
          </div>

          <!-- Mensaje de columna vacía -->
          <div v-if="!tareaArrastrada && tareasFiltradasPorColumna[columna].length === 0"
            class="text-center text-muted p-3" style="border: 2px dashed #ccc; border-radius: 5px;">
            No hay tareas en esta columna
          </div>

          <!-- Tareas -->
          <div class="card mb-2" v-for="tarea in tareasFiltradasPorColumna[columna]" :key="tarea.id" draggable="true"
            @dragstart="arrastrarTarea(tarea)" @dragend="finalizarArrastre">
            <div class="card-body">
              <!-- Modo edición -->
              <div v-if="tarea.editando">
                <input type="text" class="form-control my-2" v-model="tareaTemporal.texto"
                  placeholder="Nombre de la tarea" />
                <input type="date" class="form-control my-2" v-model="tareaTemporal.fecha" />
                <input type="time" class="form-control my-2" v-model="tareaTemporal.hora" />
                <select class="form-select my-2" v-model="tareaTemporal.prioridad">
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
                <div class="d-flex justify-content-between mt-3">
                  <button class="btn btn-success btn-sm" @click="guardarCambios(tarea)">Guardar cambios</button>
                  <button class="btn btn-secondary btn-sm" @click="cancelarCambios(tarea)">Cancelar cambios</button>
                </div>
              </div>

              <!-- Vista normal -->
              <div v-else>
                <h5 class="card-title d-flex align-items-center">
                  {{ tarea.texto }}
                  <i class="ms-2" :class="iconoPrioridad(tarea.prioridad)" :title="`Prioridad: ${tarea.prioridad}`"></i>
                </h5>
                <p class="card-text">
                  Fecha: {{ tarea.fecha }} <br />
                  Hora: {{ tarea.hora }}
                </p>
                <div v-if="tarea.mostrarDetalles" class="alert alert-info p-2">
                  Creada el: {{ tarea.fechaCreacion }}
                </div>
                <div class="d-flex justify-content-between">
                  <button class="btn btn-info btn-sm" @click="alternarDetalles(tarea)">
                    <i :class="tarea.mostrarDetalles ? 'bi bi-dash' : 'bi bi-plus'"></i>
                  </button>
                  <button class="btn btn-warning btn-sm" @click="activarEdicion(tarea)">
                    Editar
                  </button>
                  <button class="btn btn-danger btn-sm" @click="eliminarTarea(tarea.id)">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Footer modificado -->
  <footer class="footer" :class="modoOscuro ? 'bg-dark text-white' : 'bg-light'">
    <div class="footer-content">
      <span>Hecho por Carlos y Adrián</span>
    </div>
  </footer>
</template>

<script>
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";

export default {
  name: "HomeView",
  components: {
    Multiselect,
  },
  data() {
    return {
      // Asegurarse de que `editando` sea false para todas las tareas cargadas
      tareas: JSON.parse(localStorage.getItem("tareas"))?.map((tarea) => ({
        ...tarea,
        editando: false,
      })) || [],
      nuevaTarea: {
        texto: "",
        fecha: "",
        hora: "",
        prioridad: "",
      },
      tareaTemporal: {
        texto: "",
        fecha: "",
        hora: "",
        prioridad: "",
      },
      filtroPrioridades: [],
      opcionesPrioridad: ["Alta", "Media", "Baja"],
      mostrarFormulario: false,
      tareaArrastrada: null,
      modoOscuro: JSON.parse(localStorage.getItem('modoOscuro')) || false,
    };
  },
  created() {
    // Aplicar el modo oscuro al cargar la página si estaba activo
    if (this.modoOscuro) {
      document.body.classList.add('bg-dark', 'text-white');
    }
  },
  computed: {
    tareasPorColumna() {
      return {
        "Por hacer": this.tareas.filter((tarea) => tarea.columna === "Por hacer"),
        "En proceso": this.tareas.filter((tarea) => tarea.columna === "En proceso"),
        "Completado": this.tareas.filter((tarea) => tarea.columna === "Completado"),
      };
    },
    tareasFiltradasPorColumna() {
      if (this.filtroPrioridades.length === 0) {
        return this.tareasPorColumna;
      }
      return {
        "Por hacer": this.tareasPorColumna["Por hacer"].filter((tarea) =>
          this.filtroPrioridades.includes(tarea.prioridad)
        ),
        "En proceso": this.tareasPorColumna["En proceso"].filter((tarea) =>
          this.filtroPrioridades.includes(tarea.prioridad)
        ),
        "Completado": this.tareasPorColumna["Completado"].filter((tarea) =>
          this.filtroPrioridades.includes(tarea.prioridad)
        ),
      };
    },
  },
  methods: {
    toggleFormulario() {
      this.mostrarFormulario = !this.mostrarFormulario;
    },
    toggleDarkMode() {
      this.modoOscuro = !this.modoOscuro;
      localStorage.setItem('modoOscuro', this.modoOscuro);
      if (this.modoOscuro) {
        document.body.classList.add('bg-dark', 'text-white');
      } else {
        document.body.classList.remove('bg-dark', 'text-white');
      }
    },
    agregarTarea() {
      if (
        this.nuevaTarea.texto.trim() !== "" &&
        this.nuevaTarea.fecha &&
        this.nuevaTarea.hora &&
        this.nuevaTarea.prioridad
      ) {
        const fechaCreacion = new Date().toLocaleString();
        this.tareas.push({
          id: Date.now(),
          ...this.nuevaTarea,
          fechaCreacion,
          mostrarDetalles: false,
          editando: false, // Asegurar que la tarea no esté en modo edición
          columna: "Por hacer",
        });
        this.nuevaTarea = {
          texto: "",
          fecha: "",
          hora: "",
          prioridad: "",
        };
        this.mostrarFormulario = false; // Oculta el formulario al agregar la tarea
        this.guardarTareas();
      }
    },
    iconoPrioridad(prioridad) {
      switch (prioridad) {
        case "Alta":
          return "bi bi-fire text-danger";
        case "Media":
          return "bi bi-lightning-fill text-warning";
        case "Baja":
          return "bi bi-cup-hot text-success";
        default:
          return "";
      }
    },
    alternarDetalles(tarea) {
      tarea.mostrarDetalles = !tarea.mostrarDetalles;
    },
    activarEdicion(tarea) {
      // Crear una copia de la tarea para editar
      this.tareaTemporal = { ...tarea };
      tarea.editando = true; // Activar el modo edición
    },
    guardarCambios(tarea) {
      // Aplicar los cambios de `tareaTemporal` a la tarea original
      Object.assign(tarea, this.tareaTemporal);
      tarea.editando = false; // Salir del modo edición
      this.guardarTareas();
    },
    cancelarCambios(tarea) {
      // Cancelar cambios y salir del modo edición
      tarea.editando = false;
    },
    eliminarTarea(id) {
      this.tareas = this.tareas.filter((tarea) => tarea.id !== id);
      this.guardarTareas();
    },
    arrastrarTarea(tarea) {
      this.tareaArrastrada = tarea;
    },
    finalizarArrastre() {
      this.tareaArrastrada = null;
    },
    permitirArrastre(event) {
      event.preventDefault();
    },
    moverTarea(nuevaColumna) {
      if (this.tareaArrastrada) {
        this.tareaArrastrada.columna = nuevaColumna;
        this.finalizarArrastre();
        this.guardarTareas();
      }
    },
    guardarTareas() {
      // Antes de guardar, eliminamos `editando` para evitar guardar estados temporales
      const tareasSinEditando = this.tareas.map((tarea) => ({
        ...tarea,
        editando: false,
      }));
      localStorage.setItem("tareas", JSON.stringify(tareasSinEditando));
    },
  },
};
</script>


<style>
.card {
  cursor: grab;
}

.card:active {
  cursor: grabbing;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.5s ease;
}

.slide-enter-from,
.slide-leave-to {
  max-height: 0;
  opacity: 0;
}

.hidden {
  display: none !important;
}

/* Nuevos estilos para el footer */
.footer {
  position: fixed; /* Cambiado de relative a fixed */
  bottom: 0;
  width: 100%;
  padding: 1rem 0;
  z-index: 1000;
}

/* Asegurar que el contenido principal no quede tapado por el footer */
.container {
  margin-bottom: 80px; /* Dar espacio para que el contenido no quede detrás del footer */
}

body {
  margin: 0;
  min-height: 100vh;
}

#app {
  min-height: 100vh;
  position: relative;
  padding-bottom: 60px; /* Altura del footer */
}

/* Estilos actualizados para el footer */
.footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 60px; /* Altura fija del footer */
  z-index: 1000;
}

.footer-content {
  height: 100%;
  display: flex;
  align-items: flex-end; /* Alinea el contenido al final */
  justify-content: center;
  padding-bottom: 10px; /* Espacio desde el borde inferior */
}

/* Añadir estilos para hacer el navbar más delgado */
.navbar-slim {
  padding-top: 0;
  padding-bottom: 0;
  min-height: 50px; /* Aumentado ligeramente para dar más espacio */
}

.navbar-slim .navbar-brand {
  padding-top: 0;
  padding-bottom: 0;
  margin-bottom: 8px; /* Añadir margen inferior para equilibrar */
}

.navbar-slim .btn {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  margin-bottom: 8px; /* Añadir margen inferior para equilibrar */
}

/* Resto de los estilos permanecen igual */
</style>
