# 🚀 Deployment Guide - Polkax402 Backend

Este documento te guía paso a paso para desplegar el backend de Polkax402 en tu instancia EC2 de AWS.

## 📋 Requisitos

- ✅ Instancia EC2 de AWS (Ubuntu 20.04/22.04 recomendado)
- ✅ Dominio apuntando a la IP de tu EC2 (`polkax402.com`)
- ✅ SSH access a tu EC2
- ✅ Puertos 80 y 443 abiertos en el Security Group de EC2

## 🎯 Arquitectura

```
Internet → Route53/DNS → EC2 Instance
                           ├── Nginx (reverse proxy + SSL)
                           └── Docker Container (Backend :3001)
```

## 📦 Paso 1: Preparar EC2

### 1.1 Conectar a tu EC2

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

### 1.2 Ejecutar setup inicial

```bash
# Copiar el script de setup
scp -i your-key.pem deploy/setup-ec2.sh ubuntu@your-ec2-ip:~/

# En tu EC2, ejecutar:
chmod +x setup-ec2.sh
./setup-ec2.sh
```

Este script instalará:
- Docker & Docker Compose
- Nginx
- Certbot (para SSL/HTTPS)
- Configurará el firewall

## 🔐 Paso 2: Configurar variables de entorno

### 2.1 Crear archivo .env

```bash
# En tu máquina local
cp .env.production.example .env
```

### 2.2 Editar .env con tus valores reales

```bash
nano .env  # o tu editor preferido
```

Asegúrate de configurar:
- `RECIPIENT_ADDRESS`: Tu dirección Polkadot
- `FIRECRAWL_API_KEY`: Tu API key de Firecrawl
- `OPENAI_API_KEY`: Tu API key de OpenAI
- `FACILITATOR_URL`: URL de tu facilitador X402

## 🚢 Paso 3: Desplegar

### Opción A: Deployment Automático (Recomendado)

```bash
# En tu máquina local

# 1. Editar deploy/deploy.sh con tu información de EC2
nano deploy/deploy.sh
# Cambiar EC2_HOST y EC2_USER

# 2. Dar permisos de ejecución
chmod +x deploy/deploy.sh

# 3. Ejecutar deployment
./deploy/deploy.sh
```

### Opción B: Deployment Manual

```bash
# 1. Comprimir el proyecto (en tu máquina local)
tar -czf polkax402.tar.gz \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='frontend' \
    package.json package-lock.json tsconfig.json \
    Dockerfile docker-compose.yml .dockerignore \
    src docs deploy

# 2. Copiar a EC2
scp -i your-key.pem polkax402.tar.gz ubuntu@your-ec2-ip:~/
scp -i your-key.pem .env ubuntu@your-ec2-ip:~/

# 3. En EC2, extraer y desplegar
ssh -i your-key.pem ubuntu@your-ec2-ip

sudo mkdir -p /opt/polkax402
sudo chown -R $USER:$USER /opt/polkax402
cd /opt/polkax402

tar -xzf ~/polkax402.tar.gz
mv ~/.env .env

# 4. Construir y ejecutar con Docker
docker-compose build
docker-compose up -d

# 5. Verificar que está corriendo
docker-compose ps
docker-compose logs -f
```

## 🌐 Paso 4: Configurar Nginx + SSL

### 4.1 Configurar Nginx

```bash
# En tu EC2
sudo cp /opt/polkax402/deploy/nginx.conf /etc/nginx/sites-available/polkax402.com

# Editar el archivo para ajustar tu dominio de frontend
sudo nano /etc/nginx/sites-available/polkax402.com
# Cambiar: add_header Access-Control-Allow-Origin "https://tu-frontend.vercel.app"

# Habilitar el sitio
sudo ln -s /etc/nginx/sites-available/polkax402.com /etc/nginx/sites-enabled/

# Remover configuración default (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t

# Si todo está OK, recargar nginx
sudo systemctl reload nginx
```

### 4.2 Obtener certificado SSL (Let's Encrypt)

```bash
# En tu EC2
sudo certbot --nginx -d polkax402.com -d www.polkax402.com

# Seguir las instrucciones interactivas
# Certbot configurará automáticamente nginx con SSL
```

## ✅ Paso 5: Verificar deployment

```bash
# Test health endpoint
curl https://polkax402.com/health

# Debería responder:
# {"status":"ok","timestamp":"...","service":"Polkax402 API",...}

# Test desde tu navegador
open https://polkax402.com
open https://polkax402.com/docs
```

## 🔄 Paso 6: Conectar Frontend en Vercel

### 6.1 Actualizar variables de entorno en Vercel

```bash
# En tu dashboard de Vercel, agregar:
NEXT_PUBLIC_API_URL=https://polkax402.com
```

### 6.2 Actualizar código del frontend

Si tu frontend tiene la URL hardcodeada, actualízala:

```typescript
// En tu frontend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://polkax402.com';
```

### 6.3 Redeploy en Vercel

```bash
# Vercel redeployará automáticamente al hacer push
git add .
git commit -m "Update API URL to production"
git push
```

## 🛠️ Comandos útiles

### Docker

```bash
# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar contenedor
docker-compose restart

# Detener contenedor
docker-compose down

# Rebuild y reiniciar
docker-compose up -d --build

# Ver estado
docker-compose ps

# Ejecutar comando en contenedor
docker-compose exec polkax402-backend sh
```

### Nginx

```bash
# Test configuración
sudo nginx -t

# Reload (sin downtime)
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# Ver logs
sudo tail -f /var/log/nginx/polkax402.access.log
sudo tail -f /var/log/nginx/polkax402.error.log
```

### SSL Certificate Renewal

```bash
# Los certificados de Let's Encrypt se renuevan automáticamente
# Para renovar manualmente:
sudo certbot renew

# Test de renovación (dry run)
sudo certbot renew --dry-run
```

## 🔍 Troubleshooting

### El contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs

# Verificar variables de entorno
docker-compose config

# Verificar que el puerto 3001 no está en uso
sudo lsof -i :3001
```

### Nginx retorna 502 Bad Gateway

```bash
# Verificar que el contenedor está corriendo
docker-compose ps

# Verificar que el puerto 3001 está escuchando
sudo netstat -tlnp | grep 3001

# Ver logs de nginx
sudo tail -f /var/log/nginx/polkax402.error.log
```

### CORS errors

```bash
# Verificar configuración de CORS en nginx.conf
# Asegúrate que Access-Control-Allow-Origin apunta a tu frontend correcto

# Test CORS
curl -H "Origin: https://tu-frontend.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -X OPTIONS https://polkax402.com/api/polka-news
```

### SSL certificate issues

```bash
# Verificar certificados
sudo certbot certificates

# Renovar
sudo certbot renew --force-renewal
```

## 📊 Monitoring

### Configurar alertas básicas

```bash
# Crear script de health check
cat > /opt/polkax402/healthcheck.sh << 'EOF'
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" https://polkax402.com/health)
if [ $response != "200" ]; then
    echo "Health check failed with status $response"
    # Aquí puedes agregar notificación (email, slack, etc.)
fi
EOF

chmod +x /opt/polkax402/healthcheck.sh

# Agregar a crontab (cada 5 minutos)
(crontab -l 2>/dev/null; echo "*/5 * * * * /opt/polkax402/healthcheck.sh") | crontab -
```

## 🎉 ¡Listo!

Tu backend ahora está:
- ✅ Corriendo en Docker en tu EC2
- ✅ Detrás de Nginx como reverse proxy
- ✅ Con HTTPS/SSL configurado
- ✅ Accesible en `https://polkax402.com`
- ✅ Solo exponiendo el puerto 3001 internamente

Tu frontend en Vercel puede conectarse a `https://polkax402.com/api/*`

## 📚 Recursos adicionales

- [Docker Compose Docs](https://docs.docker.com/compose/)
- [Nginx Docs](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
- [AWS EC2 Security Groups](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-security-groups.html)
