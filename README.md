# Viveris Carbone - Starter Project

A modern full-stack web application starter template featuring:
- **Backend**: Python FastAPI (Fast, modern, async)
- **Frontend**: React with Vite and TailwindCSS (Modern, component-based)
- **Containerization**: Docker & Docker Compose
- **Deployment**: Ready for DockerHub and VPS deployment

## 📋 Table of Contents

- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development](#development)
- [Docker Deployment](#docker-deployment)
- [Branching Strategy](#branching-strategy)
- [Pull Request Workflow](#pull-request-workflow)
- [Environment Variables](#environment-variables)
- [VPS Deployment](#vps-deployment)

## 🗂️ Project Structure

```
viveris-carbone-backend/
├── backend/                 # FastAPI backend
│   ├── main.py             # Main FastAPI application
│   ├── requirements.txt    # Python dependencies
│   ├── Dockerfile          # Backend Docker configuration
│   └── .env.example        # Backend environment template
├── frontend/               # React frontend
│   ├── src/                # Source files
│   │   ├── App.tsx         # Main React component
│   │   └── main.tsx        # Application entry point
│   ├── index.html          # HTML template
│   ├── vite.config.js      # Vite configuration
│   ├── package.json        # Node dependencies
│   ├── Dockerfile          # Frontend Docker configuration
│   ├── nginx.conf          # Nginx configuration for production
│   └── .env.example        # Frontend environment template
├── docker-compose.yml      # Docker Compose configuration
├── .env.example            # Root environment template
└── README.md               # This file
```

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Git**: Version control system
- **Docker**: Container platform (v20.10+)
- **Docker Compose**: Multi-container orchestration (v2.0+)
- **Node.js**: JavaScript runtime (v20+) - for local development
- **Python**: Programming language (v3.11+) - for local development

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Abdoullah93/viveris-carbone-backend.git
cd viveris-carbone-backend
```

### 2. Set Up Environment Variables

Copy the example environment files:

```bash
# Root environment file
cp .env.example .env

# Backend environment file
cp backend/.env.example backend/.env

# Frontend environment file
cp frontend/.env.example frontend/.env
```

Edit the `.env` files with your specific configuration.

### 3. Run with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

### 4. Stop the Application

```bash
docker-compose down
```

## 💻 Development

### Backend Development (FastAPI)

#### Local Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn src.main:app --reload
```

The backend will be available at http://localhost:8000

#### Add New Dependencies

```bash
# Install new package
pip install package-name

# Update requirements.txt
# Seulement si vous etes dans un venv svp
# sinon ca met tout les paquets de votre pc...
pip freeze > requirements.txt
```

### Frontend Development (React)

#### Local Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at http://localhost:5173

#### Add New Dependencies

```bash
npm install package-name
```

#### Build for Production

```bash
npm run build
```

## 🐳 Docker Deployment

### Build Docker Images

#### Backend Image

```bash
cd backend
docker build -t your-dockerhub-username/viveris-backend:latest .
```

#### Frontend Image

```bash
cd frontend
docker build -t your-dockerhub-username/viveris-frontend:latest .
```

### Push to DockerHub

```bash
# Login to DockerHub
docker login

# Push backend image
docker push your-dockerhub-username/viveris-backend:latest

# Push frontend image
docker push your-dockerhub-username/viveris-frontend:latest
```

### Pull on VPS

On your VPS server:

```bash
# Pull images
docker pull your-dockerhub-username/viveris-backend:latest
docker pull your-dockerhub-username/viveris-frontend:latest

# Run containers
docker run -d -p 8000:8000 --name backend your-dockerhub-username/viveris-backend:latest
docker run -d -p 80:80 --name frontend your-dockerhub-username/viveris-frontend:latest
```

## 🌳 Branching Strategy

This project uses a two-branch strategy:

### Branches

1. **`main`** - Production-ready code
   - Only contains stable, tested code
   - Protected branch (requires pull requests)
   - All releases are tagged from this branch

2. **`develop`** - Integration branch for features
   - Contains the latest development changes
   - All feature branches merge here first
   - Regularly merged into `main` for releases

### Creating Branches

```bash
# Create a new feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name

# Create a new bugfix branch
git checkout -b bugfix/your-bugfix-name

# Create a new hotfix branch from main
git checkout main
git checkout -b hotfix/your-hotfix-name
```

### Branch Naming Convention

- Features: `feature/description`
- Bug fixes: `bugfix/description`
- Hotfixes: `hotfix/description`
- Examples:
  - `feature/user-authentication`
  - `bugfix/fix-login-error`
  - `hotfix/security-patch`

## 🔄 Pull Request Workflow

### 1. Before Starting Work

```bash
# Switch to develop branch
git checkout develop

# Get latest changes
git pull origin develop

# Create your feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

```bash
# Make changes to files
# ...

# Stage your changes
git add .

# Commit with a descriptive message
git commit -m "Add: descriptive message about your changes"
```

### 3. Push Your Branch

```bash
# Push your branch to GitHub
git push origin feature/your-feature-name
```

### 4. Create Pull Request

1. Go to the repository on GitHub
2. Click "Pull requests" → "New pull request"
3. Set base branch to `develop` (or `main` for hotfixes)
4. Set compare branch to your feature branch
5. Fill in the PR template:
   - **Title**: Clear, concise description
   - **Description**: What changes were made and why
   - **Testing**: How to test the changes
   - **Screenshots**: If applicable
6. Request reviews from team members
7. Wait for approval and CI checks to pass

### 5. After Approval

Once your PR is approved:

```bash
# Update your branch with latest develop
git checkout develop
git pull origin develop
git checkout feature/your-feature-name
git merge develop

# Resolve any conflicts if necessary
# Push final changes
git push origin feature/your-feature-name
```

The PR will be merged by a maintainer.

### Pull Request Best Practices

- ✅ Keep PRs small and focused
- ✅ Write clear commit messages
- ✅ Include tests for new features
- ✅ Update documentation if needed
- ✅ Ensure all CI checks pass
- ✅ Respond to review comments promptly
- ❌ Don't commit sensitive data (API keys, passwords)
- ❌ Don't push directly to `main` or `develop`

## 🔐 Environment Variables

### Backend (.env)

```env
PORT=8000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
ENVIRONMENT=development
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
```

### Important Notes

- Never commit `.env` files to Git
- Always use `.env.example` as a template
- Update `.env.example` when adding new variables
- Document all environment variables in this README

## 🚀 VPS Deployment

### Prerequisites on VPS

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### Deployment Steps

1. **SSH into your VPS**:
```bash
ssh user@your-vps-ip
```

2. **Clone the repository** (or pull latest changes):
```bash
git clone https://github.com/Abdoullah93/viveris-carbone-backend.git
cd viveris-carbone-backend
git checkout main
```

3. **Set up environment variables**:
```bash
cp .env.example .env
# Edit .env with production values
nano .env
```

4. **Pull Docker images** (if using pre-built images):
```bash
docker pull your-dockerhub-username/viveris-backend:latest
docker pull your-dockerhub-username/viveris-frontend:latest
```

5. **Start the application**:
```bash
docker-compose up -d
```

6. **Check logs**:
```bash
docker-compose logs -f
```

### Updating Deployment

```bash
# Pull latest code
git pull origin main

# Rebuild and restart containers
docker-compose down
docker-compose up -d --build

# Or pull new images
docker-compose pull
docker-compose up -d
```

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request to the `develop` branch

## 📝 License

This project is licensed under the MIT License.

## 👥 Team

- **Maintainers**: Add your team members here
- **Contributors**: See contributors list on GitHub

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Contact: your-email@example.com

---

**Happy Coding! 🚀**
