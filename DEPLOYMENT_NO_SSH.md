# 🚀 Deployment Guide - EC2 sin SSH

Esta guía es para cuando **NO puedes usar SSH** y debes conectarte a EC2 vía:
- AWS Systems Manager Session Manager
- EC2 Instance Connect
- Console web de AWS

## 📦 Paso 1: Construir y publicar imagen Docker

### 1.1 Editar script de build

```bash
# Editar deploy/build-and-push.sh
nano deploy/build-and-push.sh

# Cambiar:
DOCKER_USERNAME="nazelord"  # TU usuario de Docker Hub
```

### 1.2 Ejecutar build local

```bash
# Dar permisos
chmod +x deploy/build-and-push.sh

# Login a Docker Hub (si no lo has hecho)
docker login

# Construir y publicar
./deploy/build-and-push.sh
```

Esto creará una imagen como: `tu-usuario/polkax402-backend:latest`

## 🔐 Paso 2: Conectar a EC2 (sin SSH)

### Opción A: AWS Systems Manager Session Manager

```bash
# Instalar Session Manager plugin si no lo tienes
# https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-install-plugin.html

# Conectar
aws ssm start-session --target i-tu-instance-id --region us-east-1
```

### Opción B: EC2 Instance Connect (desde consola web)

1. Ve a la consola EC2 de AWS
2. Selecciona tu instancia
3. Click en "Connect"
4. Elige "EC2 Instance Connect"
5. Click "Connect"

### Opción C: CloudShell + Session Manager

1. Ve a AWS Console
2. Abre CloudShell (icono en la barra superior)
3. Ejecuta:
```bash
aws ssm start-session --target i-tu-instance-id
```

## 🐳 Paso 3: Instalar Docker en EC2

Una vez conectado a tu EC2, ejecutar:

```bash
# Update system
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker-compose --version

# Importante: Logout y login de nuevo para que el grupo docker tome efecto
exit
# Volver a conectar a EC2
```

## 📁 Paso 4: Crear archivos en EC2

### 4.1 Crear directorio de trabajo

```bash
# En tu EC2
mkdir -p ~/polkax402
cd ~/polkax402
```

### 4.2 Crear docker-compose.yml

```bash
# Crear archivo
nano docker-compose.yml
```

Copiar y pegar este contenido (CAMBIAR tu-usuario-dockerhub):

```yaml
version: '3.8'

services:
  polkax402-backend:
    image: tu-usuario-dockerhub/polkax402-backend:latest
    container_name: polkax402-api
    restart: unless-stopped
    ports:
      - "3001:3001"
    env_file:
      - .env
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

Guardar: `Ctrl+X`, luego `Y`, luego `Enter`

### 4.3 Crear archivo .env

```bash
# Crear archivo
nano .env
```

Copiar y pegar tus variables (CAMBIAR con tus valores reales):

```bash
NODE_ENV=production
PORT=3001

# Polkadot Configuration
NETWORK=polkax402
RECIPIENT_ADDRESS=5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
PRICE_PER_REQUEST=10000000000
CONTRACT_ADDRESS=5CR7oWebzRjmYrACqiYhh4G7vX4yZnCxT4ZaucYU9mCNvXGM

# X402 Facilitator
FACILITATOR_URL=https://facilitator.polkax402.dpdns.org/settle

# API Keys - CAMBIAR CON TUS KEYS REALES
FIRECRAWL_API_KEY=tu_firecrawl_api_key_aqui
OPENAI_API_KEY=tu_openai_api_key_aqui
```

Guardar: `Ctrl+X`, luego `Y`, luego `Enter`

### 4.4 Verificar archivos

```bash
# Ver estructura
ls -la

# Debería mostrar:
# docker-compose.yml
# .env

# Verificar contenido (sin mostrar secretos)
cat docker-compose.yml
```

## 🚀 Paso 5: Ejecutar contenedor

```bash
# En ~/polkax402

# Pull de la imagen
docker-compose pull

# Iniciar en background
docker-compose up -d

# Ver logs
docker-compose logs -f

# Ver estado
docker-compose ps
```

## ✅ Paso 6: Verificar que funciona

```bash
# Test desde dentro de EC2
curl http://localhost:3001/health

# Debería responder con JSON:
# {"status":"ok","timestamp":"...","service":"Polkax402 API",...}
```

## 🌐 Paso 7: Configurar Security Group

Para que tu API sea accesible desde internet:

1. Ve a EC2 Console → Security Groups
2. Selecciona el Security Group de tu instancia
3. Editar Inbound Rules
4. Agregar reglas:
   - Type: HTTP, Port: 80, Source: 0.0.0.0/0
   - Type: HTTPS, Port: 443, Source: 0.0.0.0/0
   - Type: Custom TCP, Port: 3001, Source: 0.0.0.0/0 (temporal para testing)

## 🔒 Paso 8: (Opcional) Configurar Nginx + SSL

Si quieres HTTPS y usar tu dominio `polkax402.com`:

### 8.1 Instalar Nginx

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

### 8.2 Crear configuración básica

```bash
sudo nano /etc/nginx/sites-available/polkax402
```

Contenido:

```nginx
server {
    listen 80;
    server_name polkax402.com www.polkax402.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # CORS
        add_header Access-Control-Allow-Origin "https://tu-frontend.vercel.app" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range,Authorization,X-Polkadot-Address,X-Polkadot-Signature" always;
    }
}
```

### 8.3 Activar configuración

```bash
sudo ln -s /etc/nginx/sites-available/polkax402 /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### 8.4 Obtener SSL

```bash
sudo certbot --nginx -d polkax402.com -d www.polkax402.com
```

## 🔄 Actualizar la aplicación

Cuando hagas cambios y necesites actualizar:

```bash
# En tu máquina local: construir y publicar nueva imagen
./deploy/build-and-push.sh

# En EC2: actualizar
cd ~/polkax402
docker-compose pull
docker-compose up -d
docker-compose logs -f
```

## 🛠️ Comandos útiles

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver estado
docker-compose ps

# Reiniciar
docker-compose restart

# Detener
docker-compose down

# Ver logs del contenedor
docker logs polkax402-api

# Entrar al contenedor
docker exec -it polkax402-api sh

# Ver uso de recursos
docker stats
```

## 🔍 Troubleshooting

### El contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs

# Ver logs del sistema Docker
sudo journalctl -u docker -f
```

### Puerto ya en uso

```bash
# Ver qué está usando el puerto 3001
sudo lsof -i :3001
sudo netstat -tlnp | grep 3001

# Matar proceso si es necesario
sudo kill -9 PID
```

### Imagen no se descarga

```bash
# Verificar que la imagen existe en Docker Hub
docker search tu-usuario/polkax402-backend

# Pull manual
docker pull tu-usuario/polkax402-backend:latest
```

### Variables de entorno no se cargan

```bash
# Verificar que .env existe
cat .env

# Recrear contenedor
docker-compose down
docker-compose up -d
```

## 🎉 ¡Listo!

Tu backend ahora está corriendo en EC2 sin necesidad de SSH. Puedes:

- ✅ Conectarte vía Session Manager cuando necesites
- ✅ Actualizar la app solo rebuildeando la imagen
- ✅ Gestionar secretos con .env en EC2
- ✅ Acceder a tu API en `http://tu-ec2-ip:3001` o `https://polkax402.com`

## 📚 Recursos

- [Docker Hub](https://hub.docker.com/)
- [AWS Session Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager.html)
- [EC2 Instance Connect](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/Connect-using-EC2-Instance-Connect.html)
