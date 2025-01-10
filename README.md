# Collab - Secure Chat Application

A secure collaboration platform built with ASP.NET Core and Angular, featuring end-to-end encryption, secure messaging, and robust authentication.

## Features

- 🔐 End-to-end encryption
- 🔑 JWT authentication
- 📝 Real-time messaging
- 👥 User collaboration
- 📊 Structured logging with Seq
- 🛡️ Rate limiting and security headers
- 🔄 Automatic key rotation
- 📱 Responsive Angular frontend

## Prerequisites

- .NET 7.0 SDK
- Node.js (v16+)
- Angular CLI
- Docker (for Seq logging)
- SQLite

## Getting Started

### Backend Setup

1. Clone the repository:
bash
git clone https://github.com/yourusername/collab.git
cd collab/CollabBackend

2. Install dependencies:
bash
dotnet restore
3. Start Seq logging (optional):
bash
docker run -d --name seq -e ACCEPT_EULA=Y -p 5341:80 datalust/seq
4. Run the backend:
bash
cd CollabBackend.Api
dotnet run
The API will be available at:
- HTTPS: https://localhost:7086
- Swagger UI: https://localhost:7086/swagger

### Frontend Setup

1. Navigate to the frontend directory:
bash
cd ../CollabFrontend
2. Install dependencies:
bash
npm install
3. Run the frontend:
bash
ng serve

The application will be available at http://localhost:4200

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Message Encryption**: End-to-end encryption using asymmetric and symmetric encryption
- **Key Rotation**: Automatic rotation of encryption keys
- **Rate Limiting**: Protection against brute force attacks
- **Security Headers**: Implementation of security best practices
- **Input Validation**: Both frontend and backend validation
- **API Versioning**: Support for API evolution
- **Request Size Limits**: Protection against large payload attacks

## API Documentation

Access the Swagger documentation at https://localhost:7086/swagger when the backend is running.

## Logging

Structured logging is implemented using Serilog and Seq:
- Console logging for development
- Seq dashboard available at http://localhost:5341
- Need to download docker container
### Start Seq logging container
docker run -d --name seq -e ACCEPT_EULA=Y -p 5341:80 datalust/seq:latest

## Configuration

Key configuration files:
- Backend: `appsettings.json`
- Frontend: `environment.ts`

### Important Settings
json
{
"ConnectionStrings": {
"DefaultConnection": "Data Source=collab.db"
},
"Jwt": {
"Key": "your-secret-key",
"ExpiryInDays": 1
}
}

## Development

### Backend Structure
- `CollabBackend.Api`: API endpoints and configuration
- `CollabBackend.Core`: Business logic and interfaces
- `CollabBackend.Infrastructure`: Data access and services

### Frontend Structure
- `src/app/auth`: Authentication components
- `src/app/messages`: Messaging features
- `src/app/admin`: Admin features
- `src/app/dashboard`: Dashboard features
- `src/app/profile`: Profile features
- `src/app/collaboration`: Collaboration features

- `src/app/shared`: Shared components and services
- `src/app/core`: Core components and services
