<template>
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
</template>

<script>
export default {
  props: {
    mostrarFormulario: Boolean,
    nuevaTarea: Object,
  },
  methods: {
    agregarTarea() {
      this.$emit('agregar-tarea');
    },
  },
};
</script>
