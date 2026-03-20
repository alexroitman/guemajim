# guemajim.com

Plataforma comunitaria de guemajim — red de préstamos y donaciones.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **Prisma 7** + PostgreSQL (adapter-pg)
- **NextAuth.js v5** (Auth.js)
- **Radix UI** + Tailwind CSS (mobile-first, paleta cálida)
- **Resend** para emails automáticos
- Deploy: **Vercel** + **Supabase**

## Primeros pasos

### 1. Variables de entorno

Editar `.env`:

```env
DATABASE_URL="postgresql://usuario:password@host:5432/guemajim"
AUTH_SECRET="..."       # openssl rand -base64 32
ADMIN_EMAIL="admin@guemajim.com"
ADMIN_PASSWORD="MiPasswordSegura!"
RESEND_API_KEY="re_..."
NEXTAUTH_URL="http://localhost:3000"
```

### 2. Base de datos

```bash
# Crear tablas
npx prisma migrate dev --name init

# Seed inicial (comunidades + admin)
npm run db:seed
```

### 3. Desarrollo

```bash
npm run dev
# → http://localhost:3000
```

### Login admin inicial

```
Email:    admin@guemajim.com   (o ADMIN_EMAIL)
Password: CambiarEstaPassword123!   (o ADMIN_PASSWORD)
```

## Flujo de la plataforma

1. Usuario se registra con DNI + comunidad → estado **PENDING**
2. Admin en `/admin` → aprueba o rechaza (email automático)
3. Usuario aprobado puede:
   - Publicar y explorar **guemajim**
   - Publicar artículos para **prestar** o **regalar**
   - **Solicitar** artículos (email al dueño)
   - **Favoritos**
   - Filtrar contenido por comunidad

## Deploy

1. Crear proyecto en **Supabase** → copiar URL a `DATABASE_URL`
2. Agregar variables en **Vercel**
3. `git push` → Vercel deploya automáticamente
4. `npx prisma migrate deploy && npm run db:seed` en producción

## Comandos

```bash
npm run dev           # Desarrollo
npm run build         # Build producción
npm run db:migrate    # Nueva migración
npm run db:seed       # Seed inicial
npm run db:studio     # Prisma Studio
```
