<template>
  <!-- Indicadores de zona de auto-scroll (movidos fuera del contenedor scrolleable) -->
  <div
    v-if="tareaArrastrada"
    class="scroll-indicator left"
    :class="{ 'active': scrollSpeed < 0 }"
  >
    <i class="bi bi-chevron-left"></i>
  </div>
  <div
    v-if="tareaArrastrada"
    class="scroll-indicator right"
    :class="{ 'active': scrollSpeed > 0 }"
  >
    <i class="bi bi-chevron-right"></i>
  </div>

  <div class="container mt-5">
    <h1 class="text-center mb-4">Lista de tareas pendientes</h1>

    <div class="d-flex justify-content-center gap-2 mb-3">
      <!-- Botón para alternar modo oscuro -->
      <button class="btn btn-secondary" @click="toggleDarkMode">
        {{ modoOscuro ? "Modo Claro" : "Modo Oscuro" }}
      </button>

      <!-- Botón para mostrar/ocultar formulario -->
      <button class="btn btn-primary" @click="toggleFormulario">
        {{ mostrarFormulario ? "Ocultar formulario" : "Nueva tarea" }}
      </button>
    </div>

    <!-- Filtro de prioridades -->
    <div :class="{ hidden: mostrarFormulario }" class="mb-4 d-flex justify-content-center">
      <div style="max-width: 600px; width: 100%;">
        <multiselect
          v-model="filtroPrioridades"
          :options="opcionesPrioridad"
          :multiple="true"
          placeholder="Filtrar por prioridad"
        />
      </div>
    </div>

    <!-- Formulario para agregar tareas con animación -->
    <transition name="slide">
      <div v-if="mostrarFormulario" class="mb-4 d-flex justify-content-center">
        <div style="max-width: 600px; width: 100%;">
          <div class="input-group mb-2">
            <input
              type="text"
              class="form-control"
              placeholder="Nombre de la tarea"
              v-model="nuevaTarea.texto"
            />
          </div>
          <div class="input-group mb-2">
            <input
              type="date"
              class="form-control"
              v-model="nuevaTarea.fecha"
            />
          </div>
          <div class="input-group mb-2">
            <input
              type="time"
              class="form-control"
              v-model="nuevaTarea.hora"
            />
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

    <!-- Botón para añadir nueva columna -->
    <div class="d-flex justify-content-center mb-3">
      <button class="btn btn-success" @click="mostrarDialogoNuevaColumna">
        Nueva columna
      </button>
    </div>

    <!-- Modal para nueva columna -->
    <div v-if="mostrarModal" class="modal d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Nueva columna</h5>
            <button type="button" class="btn-close" @click="cerrarModal"></button>
          </div>
          <div class="modal-body">
            <input
              type="text"
              class="form-control"
              v-model="nuevaColumna"
              placeholder="Nombre de la columna"
            />
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
            <button type="button" class="btn btn-primary" @click="crearColumna">Crear</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="mostrarModal" class="modal-backdrop fade show"></div>

    <!-- Contenedor scrollable para las columnas -->
    <div
      class="overflow-auto position-relative"
      ref="columnContainer"
      @mousemove="handleDragScroll"
      @touchmove="handleTouchDragScroll"
      style="min-height: 400px;"
    >
      <div class="d-flex gap-3" style="min-width: min-content">
        <div
          class="column-width"
          v-for="columna in todasLasColumnas"
          :key="columna.nombre"
        >
          <div class="d-flex justify-content-center align-items-center">
            <h3 class="text-center mb-2">
              {{ columna.nombre }}
              <span class="badge bg-secondary">{{ tareasFiltradasPorColumna[columna.nombre].length }}</span>
            </h3>
            <button
              v-if="!columna.esPredeterminada"
              class="btn btn-danger btn-sm ms-2"
              @click="eliminarColumna(columna.nombre)"
            >
              <i class="bi bi-x"></i>
            </button>
          </div>
          <div
            class="p-3 bg-light border position-relative"
            @dragover.prevent="permitirArrastre"
            @drop="moverTarea(columna.nombre)"
          >
            <!-- Texto "Arrastrar aquí" -->
            <div
              v-if="tareaArrastrada && tareaArrastrada.columna !== columna.nombre"
              class="p-3 text-center text-muted border border-primary rounded mb-2"
              style="height: 80px; display: flex; align-items: center; justify-content: center;"
            >
              Arrastrar aquí
            </div>

            <!-- Mensaje de columna vacía -->
            <div
              v-if="!tareaArrastrada && tareasFiltradasPorColumna[columna.nombre].length === 0"
              class="text-center text-muted p-3"
              style="border: 2px dashed #ccc; border-radius: 5px;"
            >
              No hay tareas en esta columna
            </div>

            <!-- Tareas -->
            <div
              class="card mb-2"
              v-for="tarea in tareasFiltradasPorColumna[columna.nombre]"
              :key="tarea.id"
              draggable="true"
              @dragstart="arrastrarTarea(tarea)"
              @dragend="finalizarArrastre"
            >
              <div class="card-body">
                <!-- Modo edición -->
                <div v-if="tarea.editando">
                  <input
                    type="text"
                    class="form-control my-2"
                    v-model="tareaTemporal.texto"
                    placeholder="Nombre de la tarea"
                  />
                  <input
                    type="date"
                    class="form-control my-2"
                    v-model="tareaTemporal.fecha"
                  />
                  <input
                    type="time"
                    class="form-control my-2"
                    v-model="tareaTemporal.hora"
                  />
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
                    <i
                      class="ms-2"
                      :class="iconoPrioridad(tarea.prioridad)"
                      :title="`Prioridad: ${tarea.prioridad}`"
                    ></i>
                  </h5>
                  <p class="card-text">
                    Fecha: {{ tarea.fecha }} <br />
                    Hora: {{ tarea.hora }}
                  </p>
                  <div v-if="tarea.mostrarDetalles" class="alert alert-info p-2">
                    Creada el: {{ tarea.fechaCreacion }}
                  </div>
                  <div class="d-flex justify-content-between">
                    <button
                      class="btn btn-info btn-sm"
                      @click="alternarDetalles(tarea)"
                    >
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
  </div>
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
      mostrarModal: false,
      nuevaColumna: '',
      columnasPersonalizadas: JSON.parse(localStorage.getItem("columnasPersonalizadas")) || [],
      columnasPredeterminadas: [
        { nombre: "Por hacer", esPredeterminada: true },
        { nombre: "En proceso", esPredeterminada: true },
        { nombre: "Completado", esPredeterminada: true }
      ],
      scrollSpeed: 0,
      scrollInterval: null,
      scrollThreshold: window.innerWidth * 0.4, // 40% del ancho de la ventana
      minScrollSpeed: 5,
      maxScrollSpeed: 25,
      autoScrollEnabled: false,
    };
  },
  created() {
    // Aplicar el modo oscuro al cargar la página si estaba activo
    if (this.modoOscuro) {
      document.body.classList.add('bg-dark', 'text-white');
    }
    // Actualizar el threshold cuando cambie el tamaño de la ventana
    window.addEventListener('resize', () => {
      this.scrollThreshold = window.innerWidth * 0.4;
    });
  },
  computed: {
    todasLasColumnas() {
      return [...this.columnasPredeterminadas, ...this.columnasPersonalizadas];
    },
    tareasPorColumna() {
      const columnas = {};
      this.todasLasColumnas.forEach(columna => {
        columnas[columna.nombre] = this.tareas.filter(
          tarea => tarea.columna === columna.nombre
        );
      });
      return columnas;
    },
    tareasFiltradasPorColumna() {
      if (this.filtroPrioridades.length === 0) {
        return this.tareasPorColumna;
      }
      const columnas = {};
      this.todasLasColumnas.forEach(columna => {
        columnas[columna.nombre] = this.tareasPorColumna[columna.nombre].filter(
          tarea => this.filtroPrioridades.includes(tarea.prioridad)
        );
      });
      return columnas;
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
      this.detenerAutoScroll();
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
    mostrarDialogoNuevaColumna() {
      this.mostrarModal = true;
      this.nuevaColumna = '';
    },
    cerrarModal() {
      this.mostrarModal = false;
      this.nuevaColumna = '';
    },
    crearColumna() {
      if (this.nuevaColumna.trim()) {
        const nombreColumna = this.nuevaColumna.trim();
        if (!this.todasLasColumnas.some(col => col.nombre === nombreColumna)) {
          this.columnasPersonalizadas.push({
            nombre: nombreColumna,
            esPredeterminada: false
          });
          this.guardarColumnasPersonalizadas();
          this.cerrarModal();
        }
      }
    },
    eliminarColumna(nombreColumna) {
      // Mover tareas a "Por hacer" antes de eliminar la columna
      this.tareas.forEach(tarea => {
        if (tarea.columna === nombreColumna) {
          tarea.columna = "Por hacer";
        }
      });

      this.columnasPersonalizadas = this.columnasPersonalizadas.filter(
        col => col.nombre !== nombreColumna
      );

      this.guardarColumnasPersonalizadas();
      this.guardarTareas();
    },
    guardarColumnasPersonalizadas() {
      localStorage.setItem(
        "columnasPersonalizadas",
        JSON.stringify(this.columnasPersonalizadas)
      );
    },
    handleDragScroll(e) {
      if (!this.tareaArrastrada) return;

      // Usar la posición relativa al documento completo
      const mouseX = e.pageX;
      const windowWidth = window.innerWidth;

      // Zonas más amplias (40% a cada lado)
      const zonaIzquierda = windowWidth * 0.4;
      const zonaDerecha = windowWidth * 0.6;

      if (mouseX < zonaIzquierda) {
        // Velocidad proporcional a la distancia desde el borde izquierdo
        const factor = (zonaIzquierda - mouseX) / zonaIzquierda;
        this.scrollSpeed = -this.maxScrollSpeed * Math.pow(factor, 1.5);
        this.iniciarAutoScroll();
      } else if (mouseX > zonaDerecha) {
        // Velocidad proporcional a la distancia desde el borde derecho
        const factor = (mouseX - zonaDerecha) / (windowWidth - zonaDerecha);
        this.scrollSpeed = this.maxScrollSpeed * Math.pow(factor, 1.5);
        this.iniciarAutoScroll();
      } else {
        this.scrollSpeed = 0;
        this.detenerAutoScroll();
      }
    },

    handleTouchDragScroll(e) {
      if (!this.tareaArrastrada) return;

      const touchX = e.touches[0].pageX;
      const windowWidth = window.innerWidth;

      const zonaIzquierda = windowWidth * 0.4;
      const zonaDerecha = windowWidth * 0.6;

      if (touchX < zonaIzquierda) {
        const factor = (zonaIzquierda - touchX) / zonaIzquierda;
        this.scrollSpeed = -this.maxScrollSpeed * Math.pow(factor, 1.5);
        this.iniciarAutoScroll();
      } else if (touchX > zonaDerecha) {
        const factor = (touchX - zonaDerecha) / (windowWidth - zonaDerecha);
        this.scrollSpeed = this.maxScrollSpeed * Math.pow(factor, 1.5);
        this.iniciarAutoScroll();
      } else {
        this.scrollSpeed = 0;
        this.detenerAutoScroll();
      }
    },
    iniciarAutoScroll() {
      if (!this.autoScrollEnabled) {
        this.autoScrollEnabled = true;
        this.scrollInterval = requestAnimationFrame(this.actualizarScroll);
      }
    },
    actualizarScroll() {
      if (this.scrollSpeed !== 0 && this.tareaArrastrada) {
        const container = this.$refs.columnContainer;
        // Suavizar el movimiento
        const scrollAmount = this.scrollSpeed * 0.5;
        container.scrollLeft += scrollAmount;
        this.scrollInterval = requestAnimationFrame(this.actualizarScroll);
      } else {
        this.detenerAutoScroll();
      }
    },
    detenerAutoScroll() {
      if (this.scrollInterval) {
        cancelAnimationFrame(this.scrollInterval);
        this.scrollInterval = null;
      }
      this.autoScrollEnabled = false;
      this.scrollSpeed = 0;
    },
  },
  beforeDestroy() {
    // Limpiar el intervalo cuando el componente se destruye
    this.detenerAutoScroll();
    window.removeEventListener('resize');
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
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

/* Añadir estos estilos nuevos */
.column-width {
  width: 350px;
  min-width: 350px;
}

.overflow-auto::-webkit-scrollbar {
  height: 8px;
}

.overflow-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.overflow-auto {
  position: relative;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch; /* Para mejor comportamiento en iOS */
  overflow-x: auto;
  padding: 0 20px; /* Añadir padding para mejor experiencia al arrastrar */
  z-index: 1;
}

.scroll-indicator {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 40vw; /* Aumentado a 40% del ancho de la ventana */
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.15;
  transition: opacity 0.3s ease;
  z-index: 1000; /* Asegurar que esté por encima de todo */
}

.scroll-indicator.left {
  left: 0;
  background: linear-gradient(90deg, rgba(0,123,255,0.4) 0%, transparent 100%);
}

.scroll-indicator.right {
  right: 0;
  background: linear-gradient(-90deg, rgba(0,123,255,0.4) 0%, transparent 100%);
}

.scroll-indicator.active {
  opacity: 0.3;
}

.scroll-indicator i {
  font-size: 2rem;
  color: white;
  text-shadow: 0 0 10px rgba(0,0,0,0.5);
}

/* Asegurar que los indicadores no interfieran con el scroll */
.scroll-indicator {
  z-index: 2;
}
</style>
