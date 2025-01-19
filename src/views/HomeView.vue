<template>
  <div class="container mt-5">
    <h1 class="text-center mb-4">To-Do List estilo Trello</h1>

    <!-- Botón para mostrar/ocultar formulario -->
    <div class="text-center mb-3">
      <button class="btn btn-primary" @click="toggleFormulario">
        {{ mostrarFormulario ? "Ocultar formulario" : "Nueva tarea" }}
      </button>
    </div>

    <!-- Filtro de prioridades -->
    <div class="mb-4 d-flex justify-content-center">
      <div style="max-width: 600px; width: 100%;">
        <multiselect
          v-model="filtroPrioridades"
          :options="opcionesPrioridad"
          :multiple="true"
          placeholder="Filtrar por prioridad"
        />
      </div>
    </div>

    <!-- Formulario para agregar tareas -->
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

    <!-- Tres columnas -->
    <div class="row">
      <div class="col-md-4" v-for="columna in ['To Do', 'Doing', 'Done']" :key="columna">
        <h3 class="text-center">
          {{ columna }} <span class="badge bg-secondary">{{ tareasFiltradasPorColumna[columna].length }}</span>
        </h3>
        <div
          class="p-3 bg-light border"
          @dragover.prevent
          @drop="moverTarea(columna)"
        >
          <div
            class="card mb-2"
            v-for="(tarea, index) in tareasFiltradasPorColumna[columna]"
            :key="tarea.id"
            draggable="true"
            @dragstart="arrastrarTarea(tarea)"
          >
            <div class="card-body">
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
                <button class="btn btn-warning btn-sm" @click="editarTarea(tarea)">
                  Editar
                </button>
                <button class="btn btn-danger btn-sm" @click="eliminarTarea(tarea.id)">
                  Eliminar
                </button>
              </div>
              <div v-if="tarea.editando">
                <input
                  type="text"
                  class="form-control my-2"
                  v-model="tarea.texto"
                  placeholder="Nombre de la tarea"
                />
                <input
                  type="date"
                  class="form-control my-2"
                  v-model="tarea.fecha"
                />
                <input
                  type="time"
                  class="form-control my-2"
                  v-model="tarea.hora"
                />
                <select class="form-select my-2" v-model="tarea.prioridad">
                  <option value="Alta">Alta</option>
                  <option value="Media">Media</option>
                  <option value="Baja">Baja</option>
                </select>
                <button class="btn btn-success btn-sm" @click="guardarEdicion(tarea)">Guardar</button>
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
      tareas: JSON.parse(localStorage.getItem("tareas")) || [],
      nuevaTarea: {
        texto: "",
        fecha: "",
        hora: "",
        prioridad: "",
      },
      filtroPrioridades: [],
      opcionesPrioridad: ["Alta", "Media", "Baja"],
      mostrarFormulario: false,
      tareaArrastrada: null,
    };
  },
  computed: {
    tareasPorColumna() {
      return {
        "To Do": this.tareas.filter((tarea) => tarea.columna === "To Do"),
        Doing: this.tareas.filter((tarea) => tarea.columna === "Doing"),
        Done: this.tareas.filter((tarea) => tarea.columna === "Done"),
      };
    },
    tareasFiltradasPorColumna() {
      if (this.filtroPrioridades.length === 0) {
        return this.tareasPorColumna;
      }
      return {
        "To Do": this.tareasPorColumna["To Do"].filter((tarea) =>
          this.filtroPrioridades.includes(tarea.prioridad)
        ),
        Doing: this.tareasPorColumna["Doing"].filter((tarea) =>
          this.filtroPrioridades.includes(tarea.prioridad)
        ),
        Done: this.tareasPorColumna["Done"].filter((tarea) =>
          this.filtroPrioridades.includes(tarea.prioridad)
        ),
      };
    },
  },
  methods: {
    toggleFormulario() {
      this.mostrarFormulario = !this.mostrarFormulario;
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
          editando: false,
          columna: "To Do",
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
    editarTarea(tarea) {
      tarea.editando = true;
    },
    guardarEdicion(tarea) {
      tarea.editando = false;
      this.guardarTareas();
    },
    eliminarTarea(id) {
      this.tareas = this.tareas.filter((tarea) => tarea.id !== id);
      this.guardarTareas();
    },
    arrastrarTarea(tarea) {
      this.tareaArrastrada = tarea;
    },
    moverTarea(nuevaColumna) {
      if (this.tareaArrastrada) {
        this.tareaArrastrada.columna = nuevaColumna;
        this.tareaArrastrada = null;
        this.guardarTareas();
      }
    },
    guardarTareas() {
      localStorage.setItem("tareas", JSON.stringify(this.tareas));
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
</style>
