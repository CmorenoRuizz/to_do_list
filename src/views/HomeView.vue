<template>
  <div class="container mt-5">
    <AsideMenu />
    <h1 class="text-center mb-4">Lista de tareas pendientes</h1>
    <div class="d-flex justify-content-center gap-2 mb-3">
      <button class="btn btn-secondary" @click="toggleDarkMode">
        {{ modoOscuro ? "Modo Claro" : "Modo Oscuro" }}
      </button>
      <button class="btn btn-primary" @click="toggleFormulario">
        {{ mostrarFormulario ? "Ocultar formulario" : "Nueva tarea" }}
      </button>
    </div>
    <div :class="{ hidden: mostrarFormulario }" class="mb-4 d-flex justify-content-center">
      <div style="max-width: 600px; width: 100%;">
        <multiselect v-model="filtroPrioridades" :options="opcionesPrioridad" :multiple="true"
          placeholder="Filtrar por prioridad" />
      </div>
    </div>
    <transition name="slide">
      <div v-if="mostrarFormulario" class="mb-4 d-flex justify-content-center">
        <TaskForm :nuevaTarea="nuevaTarea" :agregarTarea="agregarTarea" />
      </div>
    </transition>
    <div class="row">
      <div class="col-md-4" v-for="columna in ['Por hacer', 'En proceso', 'Completado']" :key="columna">
        <h3 class="text-center">
          {{ columna }} <span class="badge bg-secondary">{{ tareasFiltradasPorColumna[columna].length }}</span>
        </h3>
        <div class="p-3 bg-light border position-relative" @dragover.prevent="permitirArrastre"
          @drop="moverTarea(columna)">
          <div v-if="tareaArrastrada && tareaArrastrada.columna !== columna"
            class="p-3 text-center text-muted border border-primary rounded mb-2"
            style="height: 80px; display: flex; align-items: center; justify-content: center;">
            Arrastrar aquí
          </div>
          <div v-if="!tareaArrastrada && tareasFiltradasPorColumna[columna].length === 0"
            class="text-center text-muted p-3" style="border: 2px dashed #ccc; border-radius: 5px;">
            No hay tareas en esta columna
          </div>
          <TaskCard v-for="tarea in tareasFiltradasPorColumna[columna]" :key="tarea.id" :tarea="tarea"
            :tareaTemporal="tareaTemporal" :iconoPrioridad="iconoPrioridad" :alternarDetalles="alternarDetalles"
            :activarEdicion="activarEdicion" :guardarCambios="guardarCambios" :cancelarCambios="cancelarCambios"
            :eliminarTarea="eliminarTarea" :arrastrarTarea="arrastrarTarea" :finalizarArrastre="finalizarArrastre" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";
import { data, methods, computed } from "@/views/HomeViewData";
import TaskForm from "@/components/TaskForm.vue";
import TaskCard from "@/components/TaskCard.vue";
import AsideMenu from "@/components/AsideMenu.vue";

export default {
  name: "HomeView",
  components: {
    Multiselect,
    TaskForm,
    TaskCard,
    AsideMenu,
  },
  data,
  computed,
  methods,
  created() {
    if (this.modoOscuro) {
      document.body.classList.add('bg-dark', 'text-white');
    }
  },
};
</script>

<style src="./HomeViewStyles.css"></style>
