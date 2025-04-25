# Docker Setup for Equipment Management System

This document provides instructions for running the Equipment Management system with Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Access to serial ports (for card reader functionality)

## Hardware Requirements for Card Reader

For the card reader functionality to work, you need:
- Arduino-based RFID card reader connected to your host machine
- Proper serial port access permissions

## Configuration

1. **Identify your serial port**

   Before running the application, identify which serial port your card reader is connected to:

   ```bash
   # On Linux
   ls -l /dev/tty*

   # On macOS
   ls -l /dev/tty.*
   ```

2. **Update docker-compose.yml**

   Edit the `docker-compose.yml` file and update the `devices` section with your actual serial port path:

   ```yaml
   devices:
     - /dev/YOUR_ACTUAL_PORT:/dev/YOUR_ACTUAL_PORT
   ```

## Building and Running

1. **Build the Docker image**

   ```bash
   docker-compose build
   ```

2. **Start the application**

   ```bash
   docker-compose up
   ```

   The application will be available at http://localhost:3000

3. **Run in background (detached mode)**

   ```bash
   docker-compose up -d
   ```

4. **View logs**

   ```bash
   docker-compose logs -f
   ```

5. **Stop the application**

   ```bash
   docker-compose down
   ```

## Development Mode

For development with hot-reload capability, uncomment the volumes section in `docker-compose.yml`:

```yaml
volumes:
  - .:/app
  - /app/node_modules
  - /app/.next
```

Then run the development server inside Docker:

```bash
docker-compose run --rm -p 3000:3000 app npm run dev
```

## Troubleshooting

### Serial Port Access

If the container cannot access the serial port, ensure that:

1. The correct port is mapped in `docker-compose.yml`
2. The host user has permission to access the serial port:

   ```bash
   # On Linux, add your user to the dialout group
   sudo usermod -a -G dialout $USER
   # Then log out and back in for changes to take effect
   ```

### Container Errors

To debug container issues:

```bash
# View container logs
docker-compose logs

# Access a shell in the container
docker-compose exec app sh
``` 