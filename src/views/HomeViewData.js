export const data = () => ({
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
});

export const computed = {
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
};

export const methods = {
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
        editando: false,
        columna: "Por hacer",
      });
      this.nuevaTarea = {
        texto: "",
        fecha: "",
        hora: "",
        prioridad: "",
      };
      this.mostrarFormulario = false;
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
    this.tareaTemporal = { ...tarea };
    tarea.editando = true;
  },
  guardarCambios(tarea) {
    Object.assign(tarea, this.tareaTemporal);
    tarea.editando = false;
    this.guardarTareas();
  },
  cancelarCambios(tarea) {
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
    const tareasSinEditando = this.tareas.map((tarea) => ({
      ...tarea,
      editando: false,
    }));
    localStorage.setItem("tareas", JSON.stringify(tareasSinEditando));
  },
};
