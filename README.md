# ISS Cargo Management System

A comprehensive cargo management system for the International Space Station (ISS) that handles inventory management, item placement, waste management, and retrieval operations.

## Features

- Item Inventory Management
- Container Management
- Item Placement Optimization
- Waste Management System
- Item Retrieval System
- System Logging
- Date-based Simulation
- Priority-based Item Placement

## Tech Stack

- Backend: FastAPI (Python)
- Frontend: React.js
- Database: SQLite
- Containerization: Docker

## Prerequisites

- Python 3.11+
- Node.js 18+
- Docker (optional)

## Installation

### Using Docker (Recommended)

1. Build the Docker image:
```bash
docker build -t iss-cargo .
```

2. Run the container:
```bash
docker run -p 8000:8000 iss-cargo
```

3. Access the application at `http://localhost:3000`

### Local Development

1. Clone the repository:
```bash
git clone [repository-url]
cd iss-cargo-system
```

2. Install backend dependencies:
```bash
pip install -r requirements.txt
```

3. Initialize the database:
```bash
python init_db.py
```

4. Start the backend server:
```bash
uvicorn main:app --reload
```

5. Install frontend dependencies:
```bash
cd iss-cargo-ui
npm install
```

6. Start the frontend development server:
```bash
npm start
```

## Project Structure

```
iss-cargo-system/
├── iss-cargo-ui/           # React frontend
├── main.py                # FastAPI application
├── init_db.py            # Database initialization
├── requirements.txt      # Python dependencies
├── Dockerfile           # Docker configuration
└── containers.csv       # Sample container data
```

## API Endpoints

- `/api/items` - Item management
- `/api/containers` - Container management
- `/api/items/place` - Place items in containers
- `/api/items/waste` - Mark items as waste
- `/api/items/retrieve` - Retrieve items
- `/api/logs` - System logs
- `/api/fast-forward` - Time simulation

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
