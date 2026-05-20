# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Clone and Configure
```bash
git clone https://github.com/Abdoullah93/viveris-carbone-backend.git
cd viveris-carbone-backend
cp .env.example .env
```

### 2. Start with Docker
```bash
docker compose up -d
```

### 3. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📦 What's Included

✅ FastAPI Backend (Python 3.11)
✅ Svelte Frontend (with Vite)
✅ Docker & Docker Compose
✅ Production-ready Dockerfiles
✅ Environment templates
✅ CI/CD with GitHub Actions
✅ Deployment script for VPS
✅ Comprehensive documentation

## 📚 Documentation

- **README.md** - Complete project documentation
- **CONTRIBUTING.md** - Contribution guidelines
- **.env.example** - Environment variable template

## 🌳 Branching Strategy

- `main` - Production branch (protected)
- `develop` - Development branch (integration)

Always create feature branches from `develop` and submit PRs to `develop`.

## 🔧 Development Commands

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker
```bash
# Build and start
docker compose up --build

# View logs
docker compose logs -f

# Stop
docker compose down
```

## 🚀 Deployment

### Build and Push to DockerHub
```bash
./deploy.sh
# Select option 1 to build and push images
```

### Deploy to VPS
```bash
./deploy.sh
# Select option 3 to deploy to VPS
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes and commit: `git commit -m "Add: my feature"`
4. Push to fork: `git push origin feature/my-feature`
5. Create Pull Request to `develop` branch

## 📞 Support

- GitHub Issues: Report bugs or request features
- Documentation: See README.md for detailed information
