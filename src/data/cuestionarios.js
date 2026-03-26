// Cuestionarios de Mañana y Noche
// Para añadir o modificar preguntas, edita este fichero.
// Tipos: 'scale' (1-10), 'options' (selección única), 'multiselect' (selección múltiple), 'time' (hora)

export const cuestionarioManana = [
  {
    seccion: "Datos básicos",
    preguntas: [
      { id: "hora_despertar", label: "Hora de despertar", tipo: "time" },
      { id: "hora_acostarse", label: "Hora de acostarse (noche anterior)", tipo: "time" },
    ]
  },
  {
    seccion: "Valoración del sueño",
    preguntas: [
      { id: "horas_sueno", label: "Horas totales de sueño", tipo: "scale" },
      { id: "calidad_sueno", label: "Calidad del sueño", tipo: "scale" },
      { id: "despertares", label: "Nº de despertares nocturnos", tipo: "options", opciones: ["0", "1", "2", "3", "4 o más"] },
      { id: "sensacion_termica", label: "Sensación térmica al dormir", tipo: "options", opciones: ["Frío", "Fresco", "Confortable", "Calor"] },
      { id: "pantallas_antes_dormir", label: "Pantallas última hora antes de dormir", tipo: "options", opciones: ["No", "< 30 min", "30 min - 1h", "> 1h"] },
      { id: "tiempo_cena_dormir", label: "Tiempo entre cena y dormir", tipo: "options", opciones: ["< 1h", "1-2h", "2-3h", "> 3h"] },
      { id: "cena_pesada", label: "Sensación de cena pesada", tipo: "options", opciones: ["No", "Algo", "Bastante", "Muy pesada"] },
    ]
  },
  {
    seccion: "Síntomas al despertar",
    preguntas: [
      { id: "descansada", label: "Me desperté descansada", tipo: "options", opciones: ["Sí", "Parcialmente", "No"] },
      { id: "fatiga_despertar", label: "Fatiga al despertar", tipo: "scale" },
      { id: "dolor_articular_superior", label: "Dolor articular superior", tipo: "scale" },
      { id: "dolor_articular_central", label: "Dolor articular central", tipo: "scale" },
      { id: "dolor_articular_inferior", label: "Dolor articular inferior", tipo: "scale" },
      { id: "rigidez_despertar", label: "Rigidez al despertar", tipo: "scale" },
      { id: "claridad_mental_manana", label: "Claridad mental", tipo: "scale" },
    ]
  },
  {
    seccion: "Dolencias articulares específicas",
    preguntas: [
      { id: "manos", label: "Manos", tipo: "scale" },
      { id: "dedos_manos", label: "Dedos (manos)", tipo: "scale" },
      { id: "munecas", label: "Muñecas", tipo: "scale" },
      { id: "codos", label: "Codos", tipo: "scale" },
      { id: "cadera", label: "Cadera", tipo: "scale" },
      { id: "pecho", label: "Pecho", tipo: "scale" },
      { id: "rodillas", label: "Rodillas", tipo: "scale" },
      { id: "tobillos", label: "Tobillos", tipo: "scale" },
      { id: "pies", label: "Pies", tipo: "scale" },
      { id: "dedos_pies", label: "Dedos de los pies", tipo: "scale" },
    ]
  },
  {
    seccion: "Sensación respiratoria y circulación",
    preguntas: [
      { id: "sensacion_respiratoria", label: "Sensación respiratoria", tipo: "options", opciones: ["Normal", "Algo cargada", "Dificultad leve", "Dificultad notable"] },
      { id: "raynaud_despertar", label: "Episodio de Raynaud al despertar", tipo: "options", opciones: ["Ninguno", "Leve esporádico", "Intenso esporádico", "Con agua fría"] },
    ]
  },
  {
    seccion: "Medicación y suplementos",
    preguntas: [
      { id: "medicacion_tomada", label: "Medicación tomada", tipo: "options", opciones: ["Sí", "No", "Parcial"] },
      { id: "curcumina", label: "Curcumina", tipo: "options", opciones: ["Sí", "No"] },
    ]
  },
  {
    seccion: "Información digestiva",
    preguntas: [
      { id: "sensacion_digestiva", label: "Sensación digestiva al despertar", tipo: "options", opciones: ["Bien", "Algo pesado", "Hinchado", "Con náuseas"] },
      { id: "transito_intestinal", label: "Tránsito intestinal", tipo: "options", opciones: ["Normal", "Lento", "Muy lento", "Diarrea"] },
      { id: "necesidad_evacuar", label: "Necesidad de evacuar antes del desayuno", tipo: "options", opciones: ["Sí", "No"] },
      { id: "apetito_desayuno", label: "Apetito (deseo de desayunar)", tipo: "options", opciones: ["Sin apetito", "Poco", "Normal", "Mucho"] },
      { id: "hinchazon_abdominal", label: "Hinchazón abdominal al despertar", tipo: "scale" },
    ]
  },
  {
    seccion: "Desayuno",
    preguntas: [
      { id: "contenido_desayuno", label: "Contenido del desayuno", tipo: "multiselect", opciones: ["Fruta", "Avena", "Tostada espelta", "Huevo", "Yogur", "Frutos secos", "Otro"] },
      { id: "semillas", label: "Consumo de semillas", tipo: "multiselect", opciones: ["No", "Lino", "Chía", "Cáñamo", "Sésamo", "Mix"] },
    ]
  }
];

export const cuestionarioNoche = [
  {
    seccion: "Valoración del día",
    preguntas: [
      { id: "tipo_dia", label: "Tipo de día", tipo: "options", opciones: ["Laboral", "Descanso"] },
      { id: "comparado_ayer", label: "¿Cómo me encontré hoy comparado con ayer?", tipo: "options", opciones: ["Mucho peor", "Algo peor", "Igual", "Algo mejor", "Mucho mejor"] },
    ]
  },
  {
    seccion: "Sintomatología durante el día",
    preguntas: [
      { id: "fatiga_dia", label: "Nivel de fatiga", tipo: "scale" },
      { id: "dolor_superior_dia", label: "Dolor articular superior", tipo: "scale" },
      { id: "dolor_central_dia", label: "Dolor articular central", tipo: "scale" },
      { id: "dolor_inferior_dia", label: "Dolor articular inferior", tipo: "scale" },
      { id: "rigidez_dia", label: "Rigidez general", tipo: "scale" },
      { id: "inflamacion_superior", label: "Inflamación superior", tipo: "scale" },
      { id: "inflamacion_central", label: "Inflamación central", tipo: "scale" },
      { id: "inflamacion_inferior", label: "Inflamación inferior", tipo: "scale" },
      { id: "dolor_muscular", label: "Dolor muscular", tipo: "scale" },
    ]
  },
  {
    seccion: "Piel y sistema",
    preguntas: [
      { id: "piel_tirante_superior", label: "Piel tirante superior", tipo: "scale" },
      { id: "piel_tirante_inferior", label: "Piel tirante inferior", tipo: "scale" },
      { id: "pesadez_estomago_dia", label: "Pesadez de estómago", tipo: "scale" },
      { id: "nauseas", label: "Náuseas", tipo: "scale" },
      { id: "reflujo_dia", label: "Reflujo", tipo: "scale" },
      { id: "dificultad_respiratoria", label: "Dificultad respiratoria", tipo: "scale" },
      { id: "dolor_cabeza", label: "Dolor de cabeza", tipo: "scale" },
      { id: "claridad_mental_dia", label: "Claridad mental", tipo: "scale" },
      { id: "concentracion", label: "Capacidad de concentración", tipo: "scale" },
      { id: "presion_toracica", label: "Presión torácica", tipo: "scale" },
      { id: "animo_irritabilidad", label: "Estado de ánimo / irritabilidad", tipo: "scale" },
      { id: "calidad_global_dia", label: "Calidad global del día", tipo: "scale" },
    ]
  },
  {
    seccion: "Raynaud",
    preguntas: [
      { id: "raynaud_dia", label: "Episodio de Raynaud durante el día", tipo: "options", opciones: ["Ninguno", "Leve esporádico", "Intenso esporádico", "Intenso con agua"] },
      { id: "exposicion_frio", label: "Exposición al frío", tipo: "options", opciones: ["No", "Breve", "Prolongada"] },
    ]
  },
  {
    seccion: "Alimentación",
    preguntas: [
      { id: "digestion_desayuno", label: "Digestión tras el desayuno", tipo: "options", opciones: ["Bien", "Malestar", "Hinchazón", "Reflujo", "Dolor abdominal"] },
      { id: "alimentos_almuerzo", label: "Alimentos del almuerzo", tipo: "multiselect", opciones: ["Carne Roja", "Carne Blanca", "Pescado", "Huevos", "Legumbres", "Lácteos Vaca", "Lácteos Cabra", "Trigo", "Espelta", "Pseudotrigos", "Tomates", "Lechugas", "Pimientos", "Pepinos", "Aceite Oliva", "AOVE", "Alcohol", "Café", "Picante", "Mantequilla", "Nueces", "Pistachos", "Leche Avena"] },
      { id: "alimentos_cena", label: "Alimentos de la cena", tipo: "multiselect", opciones: ["Carne Roja", "Carne Blanca", "Pescado", "Huevos", "Legumbres", "Lácteos Vaca", "Lácteos Cabra", "Trigo", "Espelta", "Pseudotrigos", "Tomates", "Lechugas", "Pimientos", "Pepinos", "Aceite Oliva", "AOVE", "Alcohol", "Café", "Picante", "Mantequilla", "Nueces", "Pistachos", "Leche Avena"] },
      { id: "comi_fuera", label: "Comí fuera hoy", tipo: "options", opciones: ["Sí", "No"] },
      { id: "reflujo_total", label: "Reflujo durante el día", tipo: "scale" },
      { id: "pesadez_total", label: "Pesadez de estómago", tipo: "scale" },
      { id: "hinchazon_total", label: "Hinchazón de estómago", tipo: "scale" },
      { id: "hidratacion", label: "Hidratación (agua)", tipo: "options", opciones: ["< 1L", "1-1.5L", "1.5-2L", "> 2L"] },
    ]
  },
  {
    seccion: "Actividad física",
    preguntas: [
      { id: "actividad_fisica", label: "Actividad física", tipo: "options", opciones: ["Ninguna", "Muy suave < 30min", "Suave < 1h", "Moderada < 1.30h", "Intensa > 2h"] },
      { id: "tipo_actividad", label: "Tipo de actividad", tipo: "multiselect", opciones: ["Pasear", "Nadar", "Pilates", "Yoga", "Bicicleta", "Otro"] },
      { id: "tiempo_poca_movilidad", label: "Tiempo con poca movilidad", tipo: "options", opciones: ["< 2h", "2-4h", "4-6h", "6-8h", "> 8h"] },
    ]
  },
  {
    seccion: "Estrés y carga mental",
    preguntas: [
      { id: "estres", label: "Nivel de estrés durante el día", tipo: "scale" },
      { id: "carga_mental", label: "Carga mental", tipo: "options", opciones: ["Baja", "Media", "Alta"] },
      { id: "evento_emocional", label: "Evento emocionalmente relevante", tipo: "options", opciones: ["Sí", "No"] },
    ]
  },
  {
    seccion: "Pantallas y descanso",
    preguntas: [
      { id: "horas_ordenador", label: "Horas frente al ordenador", tipo: "options", opciones: ["< 1h", "1-3h", "3-6h", "6-8h", "> 8h"] },
      { id: "horas_movil", label: "Horas frente al móvil", tipo: "options", opciones: ["< 1h", "1-3h", "3-6h", "6-8h", "> 8h"] },
      { id: "horas_tv", label: "Horas frente a la TV", tipo: "options", opciones: ["< 1h", "1-3h", "3-6h", "> 6h"] },
      { id: "trabajo_mental_intenso", label: "Trabajo mental intenso", tipo: "options", opciones: ["Sí", "No"] },
    ]
  },
  {
    seccion: "Entorno físico",
    preguntas: [
      { id: "tiempo_casa", label: "Tiempo en casa", tipo: "options", opciones: ["< 1h", "1-3h", "3-5h", "> 5h"] },
      { id: "tiempo_fuera", label: "Tiempo fuera de casa", tipo: "options", opciones: ["< 1h", "1-3h", "3-5h", "5-9h", "> 9h"] },
      { id: "temperatura_predominante", label: "Temperatura predominante", tipo: "options", opciones: ["Frío", "Fresco", "Confortable", "Calor"] },
      { id: "ventilacion", label: "Ventilación del espacio", tipo: "options", opciones: ["Bajo", "Moderado", "Intenso"] },
      { id: "climatologia", label: "Climatología", tipo: "options", opciones: ["Soleado confortable", "Soleado muy intenso", "Soleado fresco", "Calima", "Lluvioso frío", "Lluvioso confortable", "Lluvioso muy frío"] },
      { id: "aire_cargado", label: "Aire cargado / olores / humedades", tipo: "options", opciones: ["Sí", "No"] },
    ]
  },
  {
    seccion: "Medicación extra",
    preguntas: [
      { id: "medicacion_extra", label: "Medicación extra tomada", tipo: "multiselect", opciones: ["Omeprazol", "Acxxel", "Inmunosupresor", "Symbicort", "Antihistamínico", "Paracetamol", "Aciclovir"] },
    ]
  },
  {
    seccion: "Infusiones",
    preguntas: [
      { id: "infusiones_tomadas", label: "Infusiones consumidas hoy", tipo: "multiselect", opciones: ["No", "Manzanilla", "Jengibre", "Menta", "Tila", "Valeriana", "Rooibos", "Verde", "Otra"] },
    ]
  },
  {
    seccion: "Reflexión del día",
    preguntas: [
      { id: "empeoro_sintomas", label: "Algo que empeoró mis síntomas hoy", tipo: "texto", placeholder: "Opcional..." },
      { id: "ayudo_hoy", label: "Algo que me ayudó hoy", tipo: "texto", placeholder: "Opcional..." },
      { id: "tiempo_oracion", label: "Tiempo destinado a la oración", tipo: "options", opciones: ["No hoy", "< 10min", "10-20min", "20-30min", "> 30min"] },
      { id: "tiempo_biblia", label: "Tiempo destinado a la Biblia", tipo: "options", opciones: ["No hoy", "< 10min", "10-20min", "20-30min", "> 30min"] },
    ]
  }
];
