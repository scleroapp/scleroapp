# ScleroApp · Control y Seguimiento

App PWA personal para el seguimiento diario de síntomas, tensión arterial, cuestionarios, citas médicas, pruebas y medicación.

---

## Estructura del proyecto

```
mi-salud/
├── public/
│   ├── index.html
│   └── manifest.json        ← configuración PWA
├── src/
│   ├── components/
│   │   ├── BottomNav.js     ← navegación inferior
│   │   └── CuestionarioForm.js
│   ├── data/
│   │   └── cuestionarios.js ← ⚠️ aquí se editan las preguntas
│   ├── firebase/
│   │   └── config.js        ← ⚠️ aquí van tus credenciales Firebase
│   ├── hooks/
│   │   └── useAuth.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Home.js
│   │   ├── Tension.js
│   │   ├── Cuestionarios.js
│   │   ├── Citas.js
│   │   ├── Pruebas.js
│   │   ├── Medicacion.js
│   │   └── Mas.js
│   ├── App.js
│   ├── index.js
│   └── index.css
└── .github/workflows/
    └── deploy.yml           ← despliegue automático
```

---

## Configuración inicial (una sola vez)

### 1. Configura Firebase

Abre `src/firebase/config.js` y sustituye los valores de ejemplo por los de tu proyecto:

```js
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  ...
};
```

Encuéntralos en: **Firebase Console → tu proyecto → ⚙️ → Configuración del proyecto → Tu app web**

### 2. Crea los índices en Firestore

Firebase necesita índices para algunas consultas. La primera vez que uses la app verás errores en la consola del navegador con enlaces directos para crearlos. Haz clic en cada enlace y acepta. Los índices necesarios son:

- Colección `tension`: campos `uid` (asc) + `timestamp` (desc)
- Colección `cuestionarios`: campos `uid` (asc) + `fecha` (asc) + `tipo` (asc)
- Colección `citas`: campos `uid` (asc) + `fecha` (asc)
- Colección `pruebas`: campos `uid` (asc) + `fecha` (desc)
- Colección `medicacion`: campos `uid` (asc) + `timestamp` (desc)

### 3. Activa GitHub Pages

En tu repositorio de GitHub:
1. Ve a **Settings → Pages**
2. En **Source** selecciona **GitHub Actions**
3. Guarda

A partir de ahora, cada vez que subas cambios a la rama `main`, la app se desplegará automáticamente.

---

## Uso local (para probar antes de subir)

```bash
# Instalar dependencias (solo la primera vez)
npm install

# Arrancar en local
npm start
```

La app se abrirá en `http://localhost:3000`

---

## Añadir o modificar preguntas del cuestionario

Edita el fichero `src/data/cuestionarios.js`. Cada pregunta tiene este formato:

```js
{ id: "nombre_unico", label: "Texto que ve el usuario", tipo: "scale" }
```

Tipos disponibles:
- `scale` → escala del 1 al 10
- `options` → selección única (añade `opciones: ["Op1", "Op2"]`)
- `multiselect` → selección múltiple
- `time` → selector de hora
- `texto` → campo de texto libre

---

## Instalar en el móvil Android (sin Google Play)

1. Abre Chrome en tu Android
2. Ve a la URL de tu GitHub Pages: `https://TU_USUARIO.github.io/mi-salud`
3. Inicia sesión con tu cuenta
4. Chrome mostrará un banner: **"Añadir a pantalla de inicio"** → pulsa **Instalar**
5. La app aparecerá en tu pantalla de inicio como si fuera nativa

---

## Colecciones en Firebase

| Colección | Qué guarda |
|---|---|
| `tension` | Tomas de tensión arterial |
| `cuestionarios` | Respuestas diarias mañana/noche |
| `citas` | Citas médicas |
| `pruebas` | Pruebas médicas realizadas |
| `medicacion` | Registro de tomas de medicación |

Cada documento incluye el campo `uid` del usuario, garantizando que solo tú ves tus datos.
