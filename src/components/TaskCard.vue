<template>
  <div class="card mb-2" draggable="true" @dragstart="arrastrarTarea(tarea)" @dragend="finalizarArrastre">
    <div class="card-body">
      <div v-if="tarea.editando">
        <input type="text" class="form-control my-2" v-model="tareaTemporal.texto" placeholder="Nombre de la tarea" />
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
</template>

<script>
export default {
  name: "TaskCard",
  props: {
    tarea: Object,
    tareaTemporal: Object,
    iconoPrioridad: Function,
    alternarDetalles: Function,
    activarEdicion: Function,
    guardarCambios: Function,
    cancelarCambios: Function,
    eliminarTarea: Function,
    arrastrarTarea: Function,
    finalizarArrastre: Function,
  },
};
</script>
