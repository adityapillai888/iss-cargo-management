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

1. Clone the repository:
```bash
git clone https://github.com/adityapillai888/iss-cargo-management.git
cd iss-cargo-management
```

2. Build and run the Docker container:
```bash
docker build -t iss-cargo .
docker run -p 8000:8000 iss-cargo
```

3. Access the application at `http://localhost:3000`

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/adityapillai888/iss-cargo-management.git
cd iss-cargo-management
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

The application will be available at `http://localhost:3000`

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

## Usage

### Basic Operations

1. **Item Management**
   - Add new items to inventory
   - View available items
   - Check item status and location

2. **Container Management**
   - Add new containers
   - View container space usage
   - Check container load

3. **Item Placement**
   - Place items in containers
   - View optimal placement suggestions
   - Check container space availability

4. **Waste Management**
   - Mark items as waste
   - View waste items
   - Track waste management activities

5. **Item Retrieval**
   - Retrieve items from containers
   - Get retrieval instructions
   - Check blocking items

### Time Simulation

The system supports time simulation for:
- Item expiry checking
- Waste management scheduling
- Usage limit tracking

### System Logging

All operations are logged with:
- Timestamp
- Action details
- Item/Container information
- User actions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
