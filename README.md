# Sistema de Pesaje - Servieco

Este es el frontend del Sistema de Gestión de Pesaje e Inventario para Servieco. La aplicación permite registrar pesadas de camiones (ingresos y egresos), gestionar el inventario físico vs. sistema y visualizar estadísticas de stock de materiales en tiempo real.

## 🚀 Características Principales

- **Gestión de Pesadas**: Registro de entrada y salida con soporte para balanza automática o carga manual (con autorización).
- **Control de Inventario**: Módulo para contrastar el stock del sistema con el inventario físico y realizar ajustes.
- **Reportes y Analítica**: Gráficos interactivos utilizando Recharts para visualizar el stock de materiales generales y de descarga.
- **Control de Acceso (RBAC)**: Sistema de permisos basado en roles (ADMIN, OPERADOR, PORTERÍA).
- **Exportación de Datos**: Generación y descarga de reportes en formato Excel (.xlsx).
- **Administración de Usuarios**: Creación de usuarios y gestión de contraseñas.

## 🛠️ Tecnologías Utilizadas

- **React 19**: Biblioteca principal para la interfaz de usuario.
- **Redux Toolkit**: Gestión del estado global (layout, z-index, datos del gráfico).
- **Recharts**: Visualización de datos mediante gráficos de barras.
- **Axios**: Cliente HTTP para el consumo de la API REST.
- **React Router 7**: Gestión de navegación y rutas protegidas.
- **Lucide React**: Set de iconos modernos.
- **CSS3**: Estilos personalizados con diseño responsivo.

## 📦 Instalación y Configuración

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/frontend-pesaje.git
   cd frontend-pesaje
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto y configura la URL de la API:
   ```env
   VITE_API_URL=http://localhost:3000
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

## 🔐 Roles y Permisos

| Módulo | ADMIN | OPERADOR | PORTERÍA |
| :--- | :---: | :---: | :---: |
| Crear Pesadas | ✅ | ❌ | ✅ |
| Ver Registros | ✅ | ✅ | ✅ |
| Stock e Inventario | ✅ | ✅ | ❌ |
| Reciclabilidad | ✅ | ✅ | ❌ |
| Admin. Usuarios | ✅ | ❌ | ❌ |

## 📊 Estructura del Proyecto

- `src/components/`: Componentes reutilizables (Modales, Tablas, Gráficos).
- `src/pages/`: Vistas principales de la aplicación.
- `src/services/`: Configuración de Axios y llamadas a la API.
- `src/styles/`: Archivos de estilos CSS.
- `src/store/`: (Si aplica) Configuración de Redux Toolkit.

## 📝 Notas de Versión

- **v1.1.0**: Se unificó el formato de nombres de materiales en gráficos y tablas. Se ocultaron las etiquetas del eje X en los gráficos para mejorar la legibilidad.

---
© 2024 Servieco - Sistema de Gestión de Pesaje.