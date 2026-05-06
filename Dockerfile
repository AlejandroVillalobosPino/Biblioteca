# 1. Usamos una imagen oficial de Node.js versión 22 (ligera basada en Alpine)
FROM node:22-alpine

# 2. Creamos la carpeta donde vivirá nuestra app dentro del contenedor
WORKDIR /usr/src/app

# 3. Copiamos solo los archivos de dependencias primero (para aprovechar la caché de Docker)
COPY package*.json ./

# 4. Instalamos las dependencias
# Como tienes Prisma, instalamos todo limpiamente
RUN npm install

# 5. Copiamos el resto de tu código fuente (excepto lo del .dockerignore)
COPY . .

# 6. Generamos el cliente de Prisma por si estás usando PostgreSQL/MongoDB
RUN npx prisma generate

# 7. Exponemos el puerto que usa tu servidor
EXPOSE 3000

# 8. Comando para arrancar la app en producción (usa tu script "start")
CMD [ "npm", "start" ]