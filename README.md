# 📊 Sistema de Gestión - Proyecto Final Angular

> Aplicación web desarrollada con Angular para la gestión integral de clientes, productos e inscripciones. Implementa arquitectura escalable con NgRx y diseño moderno con Angular Material

[![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Angular Material](https://img.shields.io/badge/Angular_Material-009688?style=for-the-badge&logo=angular&logoColor=white)](https://material.angular.io/)
[![NgRx](https://img.shields.io/badge/NgRx-BA2BD2?style=for-the-badge&logo=ngrx&logoColor=white)](https://ngrx.io/)

## 🌐 Demo en Vivo

**[👉 Ver Aplicación](https://panel-angular-app.netlify.app/)**

### Credenciales de Prueba

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| 👤 Administrador | `admin@mail.com` | `admin123123` |
| 👥 Usuario | `test@test.com` | `123123123` |

---

## ✨ Características Principales

- ✅ **ABM de Usuarios** - Gestión completa de usuarios con roles y permisos diferenciados
- 👥 **ABM de Clientes** - Alta, baja, modificación y consulta de información de clientes
- 📦 **ABM de Productos** - Administración del catálogo completo de productos
- 📝 **Gestión de Inscripciones** - Sistema de registro y seguimiento de inscripciones
- 🎨 **UI/UX Moderna** - Interfaz responsiva con Angular Material Design
- 🔄 **Gestión de Estado** - Arquitectura robusta con NgRx Store para estado centralizado
- 🔔 **Notificaciones** - Sistema de alertas interactivas con SweetAlert2
- 🔐 **Autenticación** - Sistema de login con roles de usuario

---

## 🛠️ Stack Tecnológico

### Frontend
- **Angular** `^17.x` - Framework principal
- **Angular Material** - Componentes UI
- **NgRx** - State Management
- **TypeScript** - Lenguaje tipado
- **RxJS** - Programación reactiva
- **SCSS** - Estilos avanzados

### Herramientas
- **SweetAlert2** - Alertas modales
- **JSON-Server** - Mock API REST
- **Netlify** - Deployment

---

## 🚀 Instalación y Configuración

### Prerrequisitos
```bash
Node.js >= 18.x
npm >= 9.x
Angular CLI >= 17.x
```

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/proyecto-final-angular.git
cd proyecto-final-angular
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Iniciar JSON Server** (en una terminal)
```bash
npm run json-server
```

4. **Iniciar servidor de desarrollo** (en otra terminal)
```bash
ng serve
```

5. **Abrir en el navegador**
```
http://localhost:4200
```

---

## 📦 Scripts Disponibles
```bash
npm start          # Inicia el servidor de desarrollo
npm run build      # Construye la aplicación para producción
npm run test       # Ejecuta las pruebas unitarias
npm run json-server # Inicia el servidor JSON mock
```

---

## 📁 Estructura del Proyecto
```
src/
├── app/
│   ├── core/              # Servicios principales y guards
│   ├── shared/            # Componentes y módulos compartidos
│   ├── features/          # Módulos de funcionalidades
│   │   ├── auth/          # Autenticación
│   │   ├── clientes/      # Gestión de clientes
│   │   ├── productos/     # Gestión de productos
│   │   └── inscripciones/ # Gestión de inscripciones
│   └── store/             # NgRx store, actions, reducers
├── assets/                # Recursos estáticos
└── environments/          # Configuraciones de entorno
```

---

## 🎯 Funcionalidades por Rol

### 👤 Administrador
- ✅ Acceso completo a todos los módulos
- ✅ Gestión de usuarios del sistema
- ✅ CRUD completo de clientes, productos e inscripciones
- ✅ Visualización de reportes y estadísticas

### 👥 Usuario
- ✅ Visualización de clientes y productos
- ✅ Gestión de inscripciones
- ❌ Sin acceso a gestión de usuarios

---

## 🔧 Configuración de Entornos

### Desarrollo
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

### Producción
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://tu-api-produccion.com'
};
```

---

## 🧪 Testing
```bash
# Ejecutar pruebas unitarias
ng test

# Ejecutar pruebas con cobertura
ng test --code-coverage

# Ejecutar pruebas e2e
ng e2e
```

---

## 📝 To-Do / Mejoras Futuras

- [ ] Implementar pruebas unitarias completas
- [ ] Agregar internacionalización (i18n)
- [ ] Implementar modo oscuro
- [ ] Agregar exportación de reportes (PDF/Excel)
- [ ] Optimizar performance con lazy loading
- [ ] Implementar PWA capabilities

---

## 👨‍💻 Autor

**Bruno Perez**

- GitHub: [@tu-usuario](https://github.com/tu-usuario)
- LinkedIn: [Tu Perfil](https://linkedin.com/in/tu-perfil)
- Email: tu-email@example.com

---

## 🙏 Agradecimientos

- [Angular Team](https://angular.io/) por el excelente framework
- [Material Design](https://material.io/) por las guías de diseño
- [NgRx Team](https://ngrx.io/) por las herramientas de gestión de estado
