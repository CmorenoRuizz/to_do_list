<template>
  <div>
    <slot :tareas="tareas" :guardarTareas="guardarTareas"></slot>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tareas: JSON.parse(localStorage.getItem('tareas'))?.map((tarea) => ({
        ...tarea,
        editando: false,
      })) || [],
    };
  },
  methods: {
    guardarTareas() {
      const tareasSinEditando = this.tareas.map((tarea) => ({
        ...tarea,
        editando: false,
      }));
      localStorage.setItem('tareas', JSON.stringify(tareasSinEditando));
    },
  },
};
</script>
