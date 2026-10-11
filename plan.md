# PLAN: Sistema de Gestión de Obras de Construcción

## ESTADO DE IMPLEMENTACIÓN

- ✅ **Fase 0 (Setup Inicial):** Postgres dev/test vía Docker Compose (puertos 55432/55433 para evitar conflicto con instancia local), Prisma 7 + adapter-pg configurado, Vitest+Supertest en backend, Vite+Vitest+RTL+Tailwind v4 en frontend. `npm run build` limpio en ambos.
- ✅ **Fase 1 (Autenticación):** Backend con TDD (24 tests: password/jwt utils, authService, middleware, rutas register/login/me) + seed de usuario de prueba (`admin@obra.com` / `admin12345`). Frontend con TDD (18 tests: authStore persistido, cliente axios con interceptor, servicio auth, ProtectedRoute, Login, Dashboard placeholder, routing).
- ✅ **Validación E2E:** 3 tests Playwright (backend+frontend+DB reales) — redirect sin sesión, error de credenciales, login+persistencia+reload+logout. Todos en verde.
- ✅ **Fase 2 (Base de Datos):** Schema completo (7 tablas: users, obras, gastos, empleados, empleado_obra, horas_trabajadas, quincenas, anotaciones) con enums y relaciones/cascadas. Migrado en dev y test. Seed extendido con 2 obras + 3 gastos de ejemplo. 4 tests de validación de esquema (defaults, cascada de borrado, unicidad, enum inválido).
- ✅ **Fase 3 (Obras):** Backend con TDD (10 tests: obraService CRUD + rutas `/api/obras` con Zod, auth requerida). Frontend con TDD (16 tests: servicio HTTP, hook `useObras`/`useObra`/mutations con React Query, `Modal`, `ObraForm`, página `Obras` con tabla+alta+edición+baja, página `ObraDetail`). React Query wired en `main.tsx`.
- ✅ **Validación E2E (acumulada):** 4 tests Playwright — los 3 de auth + 1 de Obras (crear → ver detalle → editar → eliminar). Todos en verde.
- ✅ **Fase 4 (Gastos):** Backend con TDD (12 tests: `gastoService` CRUD + filtros obra/categoría/rango de fechas + `resumenPorCategoria`, rutas `/api/gastos` y `/api/gastos/resumen` con Zod y validación de obra existente — 68 tests totales). Frontend con TDD (19 tests: servicio HTTP con query params, hooks `useGastos`/`useResumenGastos`/mutations, `GastoForm` con selector de obra, `CategoriaChart` (pie chart Recharts, con stub de `ResizeObserver`/`getBoundingClientRect` para jsdom), página `Gastos` con tabla filtrable + total + gráfico — 60 tests totales). Nav "Gastos" agregado al Dashboard.
- ✅ **Validación E2E (acumulada):** 5 tests Playwright — auth (3) + Obras CRUD (1) + Gastos CRUD (1: crea obra propia → registra gasto → filtra por obra → edita → elimina). Todos en verde.
- ✅ **Fase 5 (Empleados):** Backend con TDD (17 tests: `empleadoService` CRUD, `horaTrabajadaService` (registrar horas + listado mensual con `sueldoEstimado` = horas × tarifa), rutas `/api/empleados`, `/api/empleados/:id/horas` (GET/POST) con Zod — 92 tests totales). Frontend con TDD (20 tests: servicios/hooks, `EmpleadoForm`, `HorasForm`, página `Empleados` con tabla+alta+edición, página `EmpleadoDetail` con selector mes/año, horas acumuladas y sueldo estimado — 80 tests totales). Nav "Empleados" agregado al Dashboard.
  - Bug real encontrado y corregido en el camino: `listHorasByEmpleado` construía los límites del mes con `new Date(anio, mes-1, 1)` (hora local), pero las fechas llegan como strings `"2026-08-01"` que JS parsea como UTC medianoche — en UTC-3 esto excluía el primer día del mes. Se corrigió usando `Date.UTC(...)`.
- ✅ **Validación E2E (acumulada):** 6 tests Playwright — auth (3) + Obras (1) + Gastos (1) + Empleados (1: crea empleado a $250/hora, registra 160 horas, verifica sueldo estimado = $40.000, replicando el escenario exacto del plan). Todos en verde.
- ✅ **Fase 6 (Quincena):** Se agregó constraint única `(empleadoId, fechaInicio)` a `Quincena` (migración generada con `prisma migrate diff` ya que `migrate dev` no corre en modo no interactivo). Backend con TDD (13 tests: `quincenaService.calcularQuincena` (suma horas del mes × tarifa, upsert idempotente por período, no recalcula si ya está pagada) + `marcarComoPagada`, rutas `GET /api/quincenas/:empleadoId?mes=&anio=` y `PUT /api/quincenas/:id/pagar` con Zod — 105 tests totales). Frontend con TDD (9 tests: servicio/hook, página `Quincena` con selector empleado+mes/año, horas/tarifa/sueldo bruto/sueldo neto, botón "Marcar como Pagado" — 89 tests totales). Nav "Quincena" agregado. (Nota: "sueldo neto" = "sueldo bruto" por ahora — el schema no modela descuentos/retenciones; eso queda para cuando se defina esa lógica de negocio.)
- ✅ **Validación E2E (acumulada):** 7 tests Playwright — auth (3) + Obras (1) + Gastos (1) + Empleados (1) + Quincena (1: crea empleado a $250/hora, registra 160 horas, calcula quincena = $40.000, la marca como pagada y verifica que el botón desaparece). Todos en verde.
- ✅ **Fase 7 (Anotaciones):** Backend con TDD (17 tests: `anotacionService` CRUD (valida que la obra exista), rutas anidadas `GET/POST /api/obras/:id/anotaciones` + planas `PUT/DELETE /api/anotaciones/:id` con Zod — 122 tests totales). Frontend con TDD (15 tests: servicio/hook, `AnotacionForm` (título/descripción/prioridad), `AnotacionesList` (checkbox de completada, badge de prioridad, alta/baja) integrada dentro de `ObraDetail` — 104 tests totales).
- ✅ **Validación E2E (acumulada):** 8 tests Playwright — auth (3) + Obras (1) + Gastos (1) + Empleados (1) + Quincena (1) + Anotaciones (1: agrega anotación a una obra → aparece en la lista → marca como completada → elimina). Todos en verde.
  - Nota de testing: el checkbox de "completada" es un componente controlado que depende del round-trip async de la mutación (React Query invalida y refetchea antes de reflejar el nuevo estado) — el `.check()` de Playwright no tolera eso porque verifica el cambio inmediatamente después del click. Se resolvió usando `.click()` + `expect().toBeChecked()` (que sí reintenta con polling).
- ⬜ Fases 8-10: pendientes (dashboard, reportes, deployment).

---

## CONTEXTO

**Problema:** Necesitas un sistema profesional, escalable y bien arquitectado desde el inicio para gestionar obras de construcción, empleados, gastos y sueldos. El sistema debe manejar múltiples obras simultáneamente, tracking de gastos por categoría, cálculo de quincenas y anotaciones operacionales.

**Alcance:** Sistema full-stack web (React + Node + PostgreSQL) con autenticación, 5 módulos principales (obras, gastos, empleados, quincena, anotaciones) y dashboard analítico.

**Timeline estimado:** 4-5 semanas (80-120 horas de desarrollo)

---

## STACK TECNOLÓGICO RECOMENDADO (JUSTIFICADO)

### 🎨 FRONTEND: React 18 + TypeScript + Vite

**Por qué React:**
- ✅ Componentes reutilizables (formularios, tarjetas, tablas aparecen múltiples veces)
- ✅ Estado complejo: filtros, búsquedas, paginación, cálculos en tiempo real
- ✅ Ecosystem maduro con librerías para todo (gráficos, tablas, formularios)
- ✅ DevTools superiores (React DevTools, HMR instantáneo)

**Por qué TypeScript (no JS puro):**
- 🔒 Detecta 30-40% de bugs en compile-time (typos, tipos incorrectos)
- 🔒 Autofill en editor: `obra.` → te muestra qué propiedades existen
- 🔒 Refactoring seguro: cambiar `obra.presupuesto` → TypeScript te dice qué 47 lugares rompes

**Por qué Vite (no Create React App):**
- ⚡ Dev server inicia en 1 segundo vs 30 segundos CRA
- 📦 Build 30% más pequeño (usa ES modules nativos)
- 🔥 HMR: cambias código, se actualiza sin perder estado

#### Librerías Complementarias:
- **React Router v6**: Navegación entre páginas
- **TanStack Query**: Caché de datos servidor, sincronización automática, reintentos
- **Zustand**: Estado global (1KB, sin Redux boilerplate)
- **React Hook Form + Zod**: Formularios performantes con validación type-safe
- **Recharts**: Gráficos (pie, bar, line) reactivos y responsivos
- **React Table**: Tablas con sorting, filtering, pagination
- **Tailwind CSS + shadcn/ui**: UI profesional, accesibilidad built-in
- **date-fns**: Manejo de fechas (modular, inmutable)

**Alternativas rechazadas:**
- ❌ Vue.js: Más pequeño que React pero less ecosystem
- ❌ Svelte: Excelente pero menos librerías maduras para tablas/gráficos
- ❌ jQuery: No escalable, no reutilizable para sistema complejo

---

### 🔧 BACKEND: Node.js + Express.js + TypeScript

**Por qué Node.js:**
- ✅ Mismo lenguaje frontend = team tónica, comparten types
- ✅ Non-blocking I/O: maneja 1000+ conexiones simultáneamente
- ✅ Escalable horizontalmente (vs PHP)
- ✅ NPM ecosystem maduro con librerías probadas

**Por qué Express.js:**
- ✅ Minimalista (no impone estructura como NestJS)
- ✅ Middleware simple: autenticación, validación, logging se aplican fácilmente
- ✅ Documentado: toneladas de tutoriales y respuestas Stack Overflow
- ✅ Performante para APIs REST

#### Librerías Backend Clave:
- **Prisma**: ORM type-safe, migrations automáticas, best-in-class DX
- **bcrypt**: Hash de contraseñas (lento a propósito, resiste fuerza bruta)
- **jsonwebtoken**: Autenticación stateless con JWT (escalable)
- **Zod**: Validación type-safe (COMPARTIBLE con frontend)
- **cors**: Permitir requests desde otro dominio
- **morgan**: Logging de requests HTTP
- **dotenv**: Variables de entorno (API keys, conexiones BD)

**Alternativas rechazadas:**
- ❌ NestJS: Más "enterprise" pero overkill para MVP, más boilerplate
- ❌ FastAPI (Python): Excelente pero obligaría cambio de lenguaje
- ❌ PHP/Laravel: Más lento que Node para APIs REST puras

---

### 🗄️ DATABASE: PostgreSQL

**Por qué PostgreSQL:**
- ✅ Relaciones complejas: Obra → N Gastos → N Empleados (SQL JOIN efficiente)
- ✅ ACID garantizado: datos nunca quedan inconsistentes
- ✅ Índices para queries rápidas (búsqueda gastos por rango fechas)
- ✅ Gratis, open source, escalable de 10 a 100,000 obras sin cambios

**Contra MongoDB:**
- ❌ MongoDB es NoSQL, sin JOIN efficiente
- ❌ Una obra con 500 gastos = 500 queries vs 1 JOIN SQL
- ❌ Más lento para datos transaccionales (gastos, sueldos)

**Contra SQLite:**
- ❌ Funciona localmente pero no es multi-usuario (no escala)

---

## ARQUITECTURA: DISEÑO DE BD Y MODELOS

### Tablas Principales:

```
users
├── id (UUID)
├── email (UNIQUE)
├── password_hash (bcrypt)
├── nombre
├── rol (admin, gerente, empleado)
└── timestamps

obras
├── id (UUID)
├── nombre
├── descripcion
├── fecha_inicio, fecha_fin, estado
├── presupuesto
├── user_id (FK → users)
└── timestamps

gastos
├── id (UUID)
├── obra_id (FK → obras)
├── monto
├── categoria (materiales, mano_obra, equipos, servicios, otros)
├── detalle
├── fecha
├── user_id (FK → users)
└── timestamps

empleados
├── id (UUID)
├── nombre, email, dni
├── tarifa_por_hora
├── estado (activo, inactivo)
└── timestamps

empleado_obra (relación many-to-many)
├── id (UUID)
├── empleado_id (FK → empleados)
├── obra_id (FK → obras)
├── fecha_inicio, fecha_fin
├── rol_en_obra
└── timestamps

horas_trabajadas
├── id (UUID)
├── empleado_id (FK → empleados)
├── obra_id (FK → obras)
├── fecha
├── horas (ej: 8.5)
├── detalle
├── user_id (FK → users)
└── timestamps

quincenas
├── id (UUID)
├── empleado_id (FK → empleados)
├── fecha_inicio, fecha_fin
├── horas_totales
├── monto_total
├── estado (calculada, pagada, pendiente)
└── timestamps

anotaciones
├── id (UUID)
├── obra_id (FK → obras)
├── titulo
├── descripcion
├── prioridad (baja, media, alta)
├── completada (boolean)
├── user_id (FK → users)
└── timestamps
```

**Decisiones de diseño:**
- UUID: Privacidad, distributed-friendly
- Foreign keys: Integridad referencial
- Timestamps: Auditoría (created_at, updated_at)
- Enums: Validación a nivel BD (no strings erróneos)

---

## ESTRUCTURA DE PROYECTO

### Frontend (`/frontend`)
```
src/
├── components/
│   ├── common/           # Reutilizables (Table, Modal, Button, Card)
│   ├── layout/           # Sidebar, Header, ProtectedRoute
│   └── features/         # Específicos (Dashboard, Obras, Gastos, etc)
├── pages/                # Login, Dashboard, Obras, Gastos, Empleados, Quincena
├── hooks/                # useAuth, useExpenses, useObras, usePaginación
├── services/             # API clients (auth.ts, obras.ts, gastos.ts)
├── store/                # Zustand stores (authStore, filtersStore)
├── types/                # TypeScript types (compartibles con backend)
├── utils/                # currency(), dateFormat(), calcularSueldo()
├── styles/               # globals.css, themes.css
├── App.tsx               # Router principal
└── main.tsx              # Entry point Vite
```

### Backend (`/backend`)
```
src/
├── routes/               # auth, obras, gastos, empleados, quincena, anotaciones
├── controllers/          # Lógica de negocios (listObras, createObra, etc)
├── middleware/           # auth.ts (JWT verify), validation.ts (Zod)
├── services/             # Lógica reutilizable (authService, quincenaService)
├── utils/                # jwt.ts, password.ts, errorMessages.ts
├── types/                # TypeScript types (compartibles con frontend)
├── prisma/
│   └── schema.prisma     # Definición de BD (Prisma handles migrations)
└── index.ts              # Entry point Express
```

---

## APIS REST: ENDPOINTS PRINCIPALES

### Auth
```
POST   /api/auth/register           → { token, user }
POST   /api/auth/login              → { token, user }
POST   /api/auth/logout             → { success: true }
GET    /api/auth/me                 → { user }
```

### Obras
```
GET    /api/obras                   → { obras: [...], total }
GET    /api/obras/:id               → { obra, gastos_totales, empleados, anotaciones }
POST   /api/obras                   → { obra }
PUT    /api/obras/:id               → { obra }
DELETE /api/obras/:id               → { success: true }
```

### Gastos
```
GET    /api/gastos?obra_id=X&categoria=materiales&desde=&hasta=
       → { gastos: [...], total }
POST   /api/gastos                  → { gasto }
PUT    /api/gastos/:id              → { gasto }
DELETE /api/gastos/:id              → { success: true }
GET    /api/gastos/resumen          → { por_categoria: { materiales: 30000, ... } }
```

### Empleados
```
GET    /api/empleados               → { empleados: [...] }
POST   /api/empleados               → { empleado }
GET    /api/empleados/:id/horas?mes=8&año=2026
       → { horas_detalle: [...], total_horas: 160 }
POST   /api/empleados/:id/horas     → { registro }
```

### Quincena
```
GET    /api/quincenas/:empleado_id?mes=8&año=2026
       → { horas_totales, tarifa, sueldo_bruto, sueldo_neto, estado }
POST   /api/quincenas/:empleado_id/calcular
PUT    /api/quincenas/:id/pagar     → { quincena con estado: "pagada" }
```

### Anotaciones
```
GET    /api/obras/:id/anotaciones   → { anotaciones: [...] }
POST   /api/obras/:id/anotaciones   → { anotacion }
PUT    /api/anotaciones/:id         → { anotacion }
DELETE /api/anotaciones/:id         → { success: true }
```

### Dashboard / Reportes
```
GET    /api/reportes/dashboard
       → { total_obras, obras_activas, gasto_total_mes, ganancia_total_mes,
            resultado_neto, gastos_por_categoria, ingresos_por_obra }
GET    /api/reportes/pdf?obra_id=X&desde=&hasta=
       → descarga PDF
GET    /api/reportes/excel?desde=&hasta=
       → descarga Excel
```

---

## COMPONENTES FRONTEND PRINCIPALES

### Páginas
- **Login**: Autenticación de usuario
- **Dashboard**: KPIs (gastos totales, ganancias, resultado neto), gráficos (pie, bar), actividad reciente
- **Obras**: Lista de obras, crear/editar, vista detallada con gastos y empleados
- **Gastos**: Registrar gastos, tabla filtrable (por obra, categoría, fecha), gráfico por categoría
- **Empleados**: Listar, crear, editar, registrar horas trabajadas
- **Quincena**: Seleccionar empleado + período, mostrar horas, tarifa, sueldo bruto/neto, marcar como pagado
- **Reportes**: Filtros, descargar PDF/Excel

### Componentes Reutilizables
- **Table**: Tabla genérica con React Table (sorting, filtering, pagination)
- **Modal**: Dialog para crear/editar
- **FormField**: Input + label + error
- **Card**: Tarjeta para KPIs (con valores, cambio %)
- **Button**: Variants (primary, secondary, danger)
- **Chart**: Wrapper de Recharts (pie, bar, line)

### Hooks Custom
- **useAuth**: Login, logout, user info, token persistence
- **useExpenses**: Listar, crear, actualizar, eliminar gastos
- **useObras**: Listar, crear, editar obras
- **useEmpleados**: Listar, crear, editar empleados
- **useHoras**: Registrar y listar horas trabajadas
- **useQuincena**: Calcular sueldos
- **usePaginación**: Lógica reutilizable de paginación

---

## IMPLEMENTACIÓN: FASES DETALLADAS

### ⚙️ Fase 0: Setup Inicial (1-2 días)
**Backend:**
- `npm init -y && npm install express cors dotenv bcrypt jsonwebtoken @prisma/client prisma`
- Crear estructura de carpetas
- `npx prisma init`
- Configurar .env (DATABASE_URL, JWT_SECRET)

**Frontend:**
- `npm create vite@latest -- --template react-ts`
- Instalar: `react-router-dom`, `zustand`, `react-hook-form`, `zod`, `@hookform/resolvers`, `recharts`, `@tanstack/react-table`, `@tanstack/react-query`, `date-fns`, `tailwind`, `shadcn/ui`
- Configurar Tailwind + shadcn

**Verificación:** Dev servers corren sin errores

---

### 🔐 Fase 1: Autenticación (2-3 días)
**Backend:**
- POST /auth/register, /auth/login (JWT generation)
- Middleware `authenticateToken`
- Seed: 1 usuario de prueba (email/password)

**Frontend:**
- Página Login
- useAuthStore (Zustand): login(), logout(), user
- ProtectedRoute: redirige a /login si no autenticado
- Botón logout en header
- Persistencia en localStorage

**Verificación:** Login funciona, token se guarda, refresh mantiene sesión, logout limpia

---

### 🗄️ Fase 2: Base de Datos (1 día)
**Backend:**
- schema.prisma completo (7 tablas)
- `npx prisma migrate dev --name init`
- Seeders (1 usuario, 2 obras de prueba, algunos gastos)

**Verificación:** PostgreSQL tiene tablas con datos, Prisma Studio funciona

---

### 🏗️ Fase 3: Obras (2-3 días)
**Backend:**
- CRUD endpoints: GET /obras, GET /obras/:id, POST, PUT, DELETE
- Controller: listObras(), getObra(), createObra(), updateObra(), deleteObra()
- Validación con Zod

**Frontend:**
- useObras hook
- ObraList page (tabla con React Table)
- ObraForm (modal crear/editar)
- ObraDetail page (ver obra con gastos, empleados asignados)

**Verificación:** Crear obra → aparece en lista, editar, eliminar funciona

---

### 💰 Fase 4: Gastos (2-3 días)
**Backend:**
- CRUD endpoints: GET /gastos (con filtros: obra, categoría, fecha), POST, PUT, DELETE
- Validación (monto > 0, categoría válida, obra existe)

**Frontend:**
- useExpenses hook (TanStack Query para caching)
- GastoForm (crear gasto, selecciona obra + categoría)
- GastoList page (tabla filtrable)
- Filtros: por obra, categoría, rango fechas
- Chart: gastos por categoría

**Verificación:** Registrar gasto → aparece en tabla, filtra correctamente, suma es correcta

---

### 👥 Fase 5: Empleados (2-3 días)
**Backend:**
- CRUD empleados: GET, POST, PUT
- GET /empleados/:id/horas (con filtros mes/año)
- POST /empleados/:id/horas (registrar horas diarias)
- Validación (tarifa > 0, horas >= 0)

**Frontend:**
- useEmpleados hook
- EmpleadoList page (tabla)
- EmpleadoForm (crear/editar)
- HorasForm (registrar horas)
- Vista: empleado con horas acumuladas, sueldo estimado

**Verificación:** Crear empleado, registrar 160 horas a $250/hora → sueldo estimado $40,000

---

### 📊 Fase 6: Quincena (2 días)
**Backend:**
- GET /quincenas/:empleado_id (calcula automáticamente)
  - Suma horas del período
  - Multiplica tarifa × horas
  - Devuelve: { horas_totales, sueldo_bruto, sueldo_neto }
- POST /quincenas/:id/pagar (marca como pagada)
- Validación (período válido, empleado existe)

**Frontend:**
- QuincenaPanel: selecciona empleado + mes/año
- Muestra: horas, tarifa, sueldo bruto, descuentos (si aplica), sueldo neto
- Botón "Marcar como Pagado"
- Exportar a PDF

**Verificación:** Seleccionar empleado + período → calcula sueldo correcto

---

### 📝 Fase 7: Anotaciones (1 día)
**Backend:**
- GET /obras/:id/anotaciones
- POST /obras/:id/anotaciones
- PUT /anotaciones/:id
- DELETE /anotaciones/:id

**Frontend:**
- AnotacionesList (dentro de ObraDetail)
- AnotacionForm (crear/editar)
- Checkbox marcar completa
- Prioridad (baja, media, alta)

**Verificación:** Agregar anotación a obra → aparece en lista, marcar como completada funciona

---

### 📈 Fase 8: Dashboard (2 días)
**Backend:**
- GET /reportes/dashboard
  - total_obras, obras_activas
  - gasto_total_mes, ganancia_total_mes, resultado_neto
  - gastos_por_categoría: { materiales: 400K, mano_obra: 300K, ... }
  - ingresos_por_obra: { Obra A: 300K, Obra B: 280K, ... }
  - últimos_movimientos: [{ tipo, monto, fecha }, ...]

**Frontend:**
- Dashboard page
- SummaryCards: 4 KPIs principales (gastos, ingresos, resultado, obras activas)
- Chart pie: gastos por categoría
- Chart bar: ingresos por obra
- Chart line: gastos acumulados tiempo
- RecentActivity: tabla de últimos movimientos
- Filtro: rango fechas

**Verificación:** Dashboard muestra números correctos, gráficos se renderizan

---

### 📄 Fase 9: Reportes y Exportación (1-2 días)
**Backend:**
- GET /reportes/pdf (genera PDF con ReportLab o similar)
- GET /reportes/excel (genera Excel)
- Filtros: obra, rango fechas

**Frontend:**
- ReportFilters (selecciona rango, tipo reporte)
- Botones descargar PDF/Excel

**Verificación:** Descargar reporte genera archivo válido, abre en Excel/Adobe

---

### ✅ Fase 10: Pulido, Tests, Deployment (3-4 días)
**Backend:**
- Tests unitarios (Jest) para funciones críticas
- Tests de integración para endpoints
- Error handling consistente
- Logs estructurados

**Frontend:**
- Tests de componentes (Vitest + React Testing Library)
- Responsive design (móvil, tablet, desktop)
- Animaciones suaves (transitions)
- Loading spinners, manejo de errores
- Accessibility (alt text, aria labels)

**Deployment:**
- Backend: Heroku, Railway, DigitalOcean, AWS
- Frontend: Vercel, Netlify
- BD: PostgreSQL en AWS RDS o Railway

**Verificación:** App funciona en producción, responsivo, rápido

---

## ARCHIVOS CRÍTICOS PARA IMPLEMENTACIÓN

### Frontend
- `src/App.tsx` - Router principal, ProtectedRoute
- `src/pages/Dashboard.tsx` - KPIs y gráficos
- `src/pages/Gastos.tsx` - Registro de gastos
- `src/store/authStore.ts` - Estado global autenticación
- `src/hooks/useAuth.ts` - Login/logout logic
- `src/services/api.ts` - Cliente HTTP con interceptores
- `src/components/common/Table.tsx` - Tabla genérica

### Backend
- `src/index.ts` - Servidor Express, configuración
- `src/routes/auth.ts` - Login, register, logout
- `src/routes/gastos.ts` - CRUD gastos
- `src/middleware/auth.ts` - Verificación JWT
- `src/services/authService.ts` - Hash password, JWT
- `src/services/quincenaService.ts` - Cálculo sueldos
- `prisma/schema.prisma` - Modelos BD

---

## VERIFICACIÓN Y TESTING

### Scenarios por Fase:

**Fase 1 (Auth):**
- ✅ Registrar usuario nuevo
- ✅ Login con credenciales correctas
- ✅ Login con credenciales incorrectas (error)
- ✅ Token persiste en localStorage
- ✅ Refresh de página mantiene sesión
- ✅ Logout limpia token

**Fase 3 (Obras):**
- ✅ Crear obra con todos los campos
- ✅ Listar obras
- ✅ Editar nombre de obra
- ✅ Eliminar obra
- ✅ Ver detalle de obra

**Fase 4 (Gastos):**
- ✅ Registrar gasto $1000, categoría "materiales", obra X
- ✅ Listar gastos de obra X (solo muestra esos)
- ✅ Filtrar por categoría
- ✅ Filtrar por rango fechas
- ✅ Total de gastos es correcto

**Fase 6 (Quincena):**
- ✅ Empleado X trabaja 160 horas a $250/hora
- ✅ Calcular quincena → $40,000
- ✅ Marcar como pagada

**Fase 8 (Dashboard):**
- ✅ KPI "Total Gastos" = suma de todos los gastos
- ✅ KPI "Resultado Neto" = ingresos - gastos
- ✅ Gráfico pie muestra distribución por categoría
- ✅ Gráfico bar muestra ingresos por obra

---

## NOTAS IMPORTANTES

1. **Seguridad:**
   - Contraseñas hasheadas con bcrypt (NUNCA guardar en plain text)
   - JWT con secreto fuerte (min 32 caracteres)
   - CORS configurado (solo frontend puede acceder)
   - Input validation con Zod (evitar inyección SQL)
   - Rate limiting en login (vs fuerza bruta)

2. **Performance:**
   - Índices en fields frecuentemente consultados (obra_id, user_id, fecha)
   - Paginación en listas grandes
   - Lazy loading de datos (TanStack Query)
   - Bundle minificado en producción

3. **Escalabilidad:**
   - UUID en lugar de integers (distributed-friendly)
   - API stateless (JWT vs sessions)
   - DB separada del servidor (PostgreSQL)
   - Frontend estático (Vercel/Netlify vs servidor)

4. **Mantenibilidad:**
   - Types compartidos frontend/backend
   - Naming conventions consistentes
   - Comments solo si "WHY" no es obvio
   - Tests desde día 1

---

## NEXT STEPS

1. ✅ Aprobación de este plan
2. **Fase 0:** Setup inicial (repos, dependencias, DB)
3. **Fase 1-10:** Implementación iterativa (1 fase = 1 PR)
4. Cada fase tiene verificación clara → no avanzar sin completarla