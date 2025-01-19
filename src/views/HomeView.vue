<template>
  <div class="container mt-5">
    <h1 class="text-center mb-4">To-Do List estilo Trello</h1>

    <!-- Tres columnas -->
    <div class="row">
      <div class="col-md-4">
        <h3 class="text-center">
          To Do <span class="badge bg-secondary">{{ tareasPorColumna['To Do'].length }}</span>
        </h3>
        <!-- Input para agregar tareas -->
        <div class="input-group mb-3">
          <input
            type="text"
            class="form-control"
            placeholder="Nueva tarea"
            v-model="nuevaTarea['To Do']"
          />
          <button class="btn btn-primary" @click="agregarTarea('To Do')">Agregar</button>
        </div>
        <!-- Tareas -->
        <div
          class="p-3 bg-light border"
          @dragover.prevent
          @drop="moverTarea('To Do')"
        >
          <div
            class="card mb-2"
            v-for="(tarea, index) in tareasPorColumna['To Do']"
            :key="tarea.id"
            draggable="true"
            @dragstart="arrastrarTarea(tarea)"
          >
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <span v-if="!tarea.editando" @dblclick="editarTarea(tarea)">
                  {{ tarea.texto }}
                </span>
                <input
                  v-else
                  type="text"
                  class="form-control"
                  v-model="tarea.texto"
                  @blur="terminarEdicion(tarea)"
                />
              </div>
              <button class="btn btn-danger btn-sm" @click="eliminarTarea(tarea.id)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Repite para Doing y Done -->
      <div class="col-md-4" v-for="columna in ['Doing', 'Done']" :key="columna">
        <h3 class="text-center">
          {{ columna }} <span class="badge bg-secondary">{{ tareasPorColumna[columna].length }}</span>
        </h3>
        <div class="input-group mb-3">
          <input
            type="text"
            class="form-control"
            placeholder="Nueva tarea"
            v-model="nuevaTarea[columna]"
          />
          <button class="btn btn-primary" @click="agregarTarea(columna)">Agregar</button>
        </div>
        <div
          class="p-3 bg-light border"
          @dragover.prevent
          @drop="moverTarea(columna)"
        >
          <div
            class="card mb-2"
            v-for="(tarea, index) in tareasPorColumna[columna]"
            :key="tarea.id"
            draggable="true"
            @dragstart="arrastrarTarea(tarea)"
          >
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <span v-if="!tarea.editando" @dblclick="editarTarea(tarea)">
                  {{ tarea.texto }}
                </span>
                <input
                  v-else
                  type="text"
                  class="form-control"
                  v-model="tarea.texto"
                  @blur="terminarEdicion(tarea)"
                />
              </div>
              <button class="btn btn-danger btn-sm" @click="eliminarTarea(tarea.id)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "HomeView",
  data() {
    return {
      tareas: JSON.parse(localStorage.getItem("tareas")) || [
        { id: 1, texto: "Tarea 1", columna: "To Do", editando: false },
        { id: 2, texto: "Tarea 2", columna: "Doing", editando: false },
        { id: 3, texto: "Tarea 3", columna: "Done", editando: false },
      ],
      nuevaTarea: { "To Do": "", Doing: "", Done: "" },
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
  },
  methods: {
    agregarTarea(columna) {
      if (this.nuevaTarea[columna].trim() !== "") {
        this.tareas.push({
          id: Date.now(),
          texto: this.nuevaTarea[columna],
          columna,
          editando: false,
        });
        this.nuevaTarea[columna] = "";
        this.guardarTareas();
      }
    },
    eliminarTarea(id) {
      this.tareas = this.tareas.filter((tarea) => tarea.id !== id);
      this.guardarTareas();
    },
    editarTarea(tarea) {
      tarea.editando = true;
    },
    terminarEdicion(tarea) {
      tarea.editando = false;
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
