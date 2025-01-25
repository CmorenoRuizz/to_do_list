<template>
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
</template>

<script>
export default {
  name: "TaskForm",
  props: {
    nuevaTarea: Object,
    agregarTarea: Function,
  },
};
</script>
