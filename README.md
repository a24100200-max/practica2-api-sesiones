# API con sesiones - Practica 2

API con Node.js + Express que maneja el inicio de sesion de un usuario.
Los usuarios estan guardados en una tabla de MySQL y la sesion se maneja
con `express-session`.

Arquitectura **MVC**, igual que las practicas anteriores.

## Endpoints

| Metodo | URL | Que hace | Necesita sesion |
|--------|-----|----------|-----------------|
| POST   | `/login`   | Compara correo y password contra la tabla `usuarios` y abre la sesion | No |
| GET    | `/perfil`  | Consulta de datos del usuario de la sesion | **Si** |
| GET    | `/estado`  | Dice si hay sesion activa y cuantos minutos le faltan | No |
| POST   | `/logout`  | Destruye la sesion y borra la cookie | **Si** |

Todas responden JSON con la forma `{ ok: true/false, mensaje, ... }`.

## 1. Crear la base de datos

**Opcion A - phpMyAdmin:**
1. Abrir XAMPP y arrancar **MySQL Database**.
2. Entrar a http://localhost/phpmyadmin
3. Pestana **Importar** -> elegir `Backend/db/practica2_api.sql` -> **Continuar**.

**Opcion B - terminal:**
```
/Applications/XAMPP/xamppfiles/bin/mysql -u root < "Backend/db/practica2_api.sql"
```

Esto crea la base `practica2_api` y la tabla `usuarios`.

## 2. Instalar dependencias

```
cd Backend
npm install
```

## 3. Arrancar el servidor

```
cd Backend
npm start
```

## 4. Usar la pagina

http://localhost:3002

Usuarios de prueba:

| Correo | Contrasena |
|--------|------------|
| arturo@ceti.mx | 12345 |
| paola@ceti.mx  | profesora |
| alumno@ceti.mx | demo123 |

> Se usa el puerto **3002** para no chocar con las otras practicas (3000 y 3001).

## Estructura

```
Practica2_API/
  Backend/
    app.js                           servidor Express + configuracion de la sesion
    .env                             credenciales de la BD y llave de la sesion
    config/database.js               pool de conexiones MySQL
    models/UsuarioModel.js           consultas SQL de la tabla usuarios
    controllers/authController.js    login, perfil, estado y logout
    routes/authRoutes.js             URLs -> controlador
    db/practica2_api.sql             script de la base de datos
  Frontend/
    index.html      formulario de acceso y datos del perfil
    css/estilos.css
    js/script.js    peticiones fetch a la API
```

## Tabla `usuarios`

| Columna        | Tipo               | Nota                                     |
|----------------|--------------------|------------------------------------------|
| id             | INT AUTO_INCREMENT | llave primaria                           |
| nombre         | VARCHAR(100)       | obligatorio                              |
| correo         | VARCHAR(150)       | UNIQUE, es con lo que se inicia sesion   |
| password       | VARCHAR(100)       | sin encriptar (asi lo pidio la practica) |
| fecha_registro | DATETIME           | se pone sola                             |

## Como funciona la sesion

1. `POST /login` compara el correo y el password contra la tabla `usuarios`.
2. Si coinciden, se guarda `req.session.usuario` (id, nombre y correo; **nunca** el password).
3. Express manda al navegador la cookie firmada `session.sid`, que dura 30 minutos.
4. En cada peticion el navegador reenvia la cookie. En `/perfil` el controlador revisa
   `req.session.usuario`: si existe responde los datos, si no responde `401 Debes iniciar sesion`.
5. `POST /logout` destruye la sesion en el servidor y borra la cookie.
