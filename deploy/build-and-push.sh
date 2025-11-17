#!/bin/bash
# Script para construir y publicar imagen Docker a Docker Hub
# Ejecutar en tu máquina local

set -e

# Configuración - CAMBIAR ESTOS VALORES
DOCKER_USERNAME="nazelord"  # Tu usuario de Docker Hub
IMAGE_NAME="polkax402-client-backend"
VERSION="latest"

echo "🐳 Construyendo y publicando imagen Docker..."

# Login a Docker Hub
echo "🔐 Login a Docker Hub..."
docker login

# Construir imagen
echo "🏗️  Construyendo imagen..."
docker build -t ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION} .
docker build -t ${DOCKER_USERNAME}/${IMAGE_NAME}:$(date +%Y%m%d-%H%M%S) .

# Publicar imagen
echo "📤 Publicando imagen a Docker Hub..."
docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}
docker push ${DOCKER_USERNAME}/${IMAGE_NAME}:$(date +%Y%m%d-%H%M%S)

echo ""
echo "✅ Imagen publicada exitosamente!"
echo ""
echo "📋 Tu imagen está en:"
echo "   docker pull ${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"
echo ""
echo "🚀 Siguiente paso en EC2:"
echo "   1. Conectar a EC2 (consola web o Session Manager)"
echo "   2. Crear el archivo docker-compose.yml (ver deploy/docker-compose-ec2.yml)"
echo "   3. Crear el archivo .env con tus variables"
echo "   4. Ejecutar: docker-compose up -d"
