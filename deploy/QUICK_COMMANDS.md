# Comandos rápidos para copiar/pegar en EC2

## 1. Instalar Docker y Docker Compose

```bash
# Update system
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker-compose --version
```

## 2. Crear directorio y archivos

```bash
# Crear directorio
mkdir -p ~/polkax402
cd ~/polkax402
```

## 3. Crear docker-compose.yml

```bash
cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  polkax402-backend:
    image: your-dockerhub-username/polkax402-backend:latest
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
EOF
```

**IMPORTANTE: Editar el archivo y cambiar `your-dockerhub-username` por tu usuario real:**

```bash
nano docker-compose.yml
# Cambiar: your-dockerhub-username por tu usuario de Docker Hub
# Guardar: Ctrl+X, Y, Enter
```

## 4. Crear archivo .env

```bash
nano .env
```

**Copiar y pegar esto (CAMBIAR LAS API KEYS):**

```
NODE_ENV=production
PORT=3001

NETWORK=polkax402
RECIPIENT_ADDRESS=5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
PRICE_PER_REQUEST=10000000000
CONTRACT_ADDRESS=5CR7oWebzRjmYrACqiYhh4G7vX4yZnCxT4ZaucYU9mCNvXGM

FACILITATOR_URL=https://facilitator.polkax402.dpdns.org/settle

FIRECRAWL_API_KEY=tu_key_aqui
OPENAI_API_KEY=tu_key_aqui
```

**Guardar: `Ctrl+X`, `Y`, `Enter`**

## 5. Ejecutar

```bash
# Pull imagen
docker-compose pull

# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f
```

## 6. Verificar

```bash
# Test
curl http://localhost:3001/health

# Ver estado
docker-compose ps
```

## 7. (Opcional) Nginx + SSL

```bash
# Instalar
sudo apt-get install -y nginx certbot python3-certbot-nginx

# Crear config
sudo nano /etc/nginx/sites-available/polkax402

# Copiar config de DEPLOYMENT_NO_SSH.md

# Activar
sudo ln -s /etc/nginx/sites-available/polkax402 /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# SSL
sudo certbot --nginx -d polkax402.com -d www.polkax402.com
```

## Comandos útiles

```bash
# Ver logs
docker-compose logs -f

# Reiniciar
docker-compose restart

# Detener
docker-compose down

# Actualizar (después de push nueva imagen)
docker-compose pull
docker-compose up -d
```
