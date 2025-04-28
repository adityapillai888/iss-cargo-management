from fastapi import FastAPI, HTTPException, UploadFile, File, Path, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Tuple
import sqlite3
from datetime import datetime, timedelta
import heapq
from collections import defaultdict
from dataclasses import dataclass
from enum import Enum
import csv
import io
import json
import os
from space_optimizer import SpaceOptimizer, Position, Dimensions, ItemPlacement, Container3D

app = FastAPI()

# Configure CORS with more specific settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# Global variable to track current date
current_date = datetime.now().date()

# Initialize global space optimizer instance
space_optimizer = SpaceOptimizer()

# Add container layout cache
container_layout_cache: Dict[str, Dict[str, Dict]] = {}

def get_cached_container_layout(container_id: str) -> Optional[Dict[str, Dict]]:
    """Get cached layout for a container"""
    return container_layout_cache.get(container_id)

def update_container_layout_cache(container_id: str, items: List[Dict]):
    """Update the cache with current container layout"""
    container_layout_cache[container_id] = {
        item['id']: {
            'x': item['x'],
            'y': item['y'],
            'z': item['z'],
            'width': item['width'],
            'height': item['height'],
            'depth': item['depth']
        }
        for item in items
    }

def clear_container_layout_cache(container_id: str):
    """Clear the cache for a container"""
    if container_id in container_layout_cache:
        del container_layout_cache[container_id]

# Initialize space optimizer on startup
@app.on_event("startup")
async def startup_event():
    """Initialize the application on startup"""
    try:
        print("DEBUG: Initializing application")
        # Initialize database first
        init_db()
        # Then initialize space optimizer
        conn = get_db()
        space_optimizer.initialize_from_db(conn)
        print("DEBUG: Application initialized successfully")
    except Exception as e:
        print(f"ERROR: Failed to initialize application: {str(e)}")
        raise
    finally:
        if conn:
            conn.close()

class Zone(str, Enum):
    CREW_QUARTERS = "Crew Quarters"
    AIRLOCK = "Airlock"
    LABORATORY = "Laboratory"
    MEDICAL_BAY = "Medical Bay"
    FOOD_STORAGE = "Food Storage"

# Database connection function
def get_db():
    conn = sqlite3.connect('iss_cargo.db')
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_db()
    cursor = conn.cursor()

    try:
        print("DEBUG: Starting database initialization")

        # Drop existing tables to ensure clean initialization
        print("DEBUG: Dropping existing tables")
        cursor.execute("DROP TABLE IF EXISTS items")
        cursor.execute("DROP TABLE IF EXISTS containers")
        cursor.execute("DROP TABLE IF EXISTS system_settings")
        cursor.execute("DROP TABLE IF EXISTS logs")

        # Create containers table with schema matching CSV
        print("DEBUG: Creating containers table")
        cursor.execute('''CREATE TABLE IF NOT EXISTS containers (
            zone TEXT,
            container_id TEXT PRIMARY KEY,
            width_cm REAL,
            depth_cm REAL,
            height_cm REAL,
            current_load REAL DEFAULT 0,
            name TEXT
        )''')

        # Create items table with all required columns
        print("DEBUG: Creating items table")
        cursor.execute('''CREATE TABLE IF NOT EXISTS items (
            id TEXT PRIMARY KEY,
            item_id TEXT UNIQUE,
            name TEXT,
            width REAL,
            height REAL,
            depth REAL,
            weight REAL,
            container_id TEXT,
            x REAL,
            y REAL,
            z REAL,
            rotation INTEGER DEFAULT 0,
            status TEXT DEFAULT 'available',
            usage_count INTEGER DEFAULT 0,
            usage_limit INTEGER,
            priority INTEGER,
            expiry_date TEXT,
            preferred_zone TEXT,
            FOREIGN KEY (container_id) REFERENCES containers (container_id)
        )''')

        # Create system_settings table
        print("DEBUG: Creating system_settings table")
        cursor.execute('''CREATE TABLE IF NOT EXISTS system_settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )''')

        # Create logs table
        print("DEBUG: Creating logs table")
        cursor.execute('''CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
            action TEXT,
            item_id TEXT,
            container_id TEXT,
            details TEXT
        )''')

        # Initialize system_settings if empty
        print("DEBUG: Initializing system_settings")
        cursor.execute('SELECT COUNT(*) FROM system_settings WHERE key = "current_date"')
        if cursor.fetchone()[0] == 0:
            print("DEBUG: Setting initial current_date")
            current_date = datetime.now().strftime('%Y-%m-%d')
            cursor.execute('INSERT INTO system_settings (key, value) VALUES (?, ?)', 
                           ('current_date', current_date))

        # Initialize container_id_map in system_settings if empty
        cursor.execute('SELECT COUNT(*) FROM system_settings WHERE key = "container_id_map"')
        if cursor.fetchone()[0] == 0:
            print("DEBUG: Initializing empty container_id_map")
            cursor.execute('INSERT INTO system_settings (key, value) VALUES (?, ?)',
                           ('container_id_map', '{}'))

        conn.commit()
        print("DEBUG: Database initialization completed successfully")

    except Exception as e:
        print(f"ERROR: Database initialization failed: {str(e)}")
        conn.rollback()
        raise

    finally:
        conn.close()


def setup_optimization_system():
    """Set up the optimization system with containers from the database"""
    conn = None
    try:
        conn = get_db()
        cursor = conn.cursor()

        print("DEBUG: Setting up optimization system")
        cursor.execute("SELECT * FROM containers")
        containers = cursor.fetchall()
        print(f"DEBUG: Found {len(containers)} containers")

        container_id_map = {}
        for idx, container in enumerate(containers, start=1):
            try:
                print(f"DEBUG: Processing container: {dict(container)}")
                container_id = container['container_id']
                container_id_map[container_id] = str(idx)
                print(f"DEBUG: Mapping container {container_id} to {idx}")

                space_optimizer.add_container(
                    container_id,
                    Dimensions(
                        float(container['width_cm']),
                        float(container['depth_cm']),
                        float(container['height_cm'])
                    )
                )
            except Exception as container_error:
                print(f"ERROR: Failed to process container {container}: {str(container_error)}")
                continue

        print("DEBUG: Updating container_id_map in system_settings")
        cursor.execute("DELETE FROM system_settings WHERE key = 'container_id_map'")
        cursor.execute("INSERT INTO system_settings (key, value) VALUES (?, ?)",
                       ('container_id_map', json.dumps(container_id_map)))
        conn.commit()
        print("DEBUG: Optimization system initialized successfully")
        return True

    except Exception as e:
        print(f"ERROR: Failed to setup optimization system: {str(e)}")
        if conn:
            conn.rollback()
        raise

    finally:
        if conn:
            conn.close()

# Utility function to reinitialize the space optimizer
def reinitialize_optimizer():
    """Reinitialize the space optimizer with fresh data from the database"""
    try:
        print("DEBUG: Reinitializing space optimizer")
        conn = get_db()
        space_optimizer.initialize_from_db(conn)
        print("DEBUG: Space optimizer reinitialized successfully")
    except Exception as e:
        print(f"ERROR: Failed to reinitialize space optimizer: {str(e)}")
        raise
    finally:
        if conn:
            conn.close()

# Pydantic models
class ItemBase(BaseModel):
    name: str
    width: float
    depth: float
    height: float
    mass: float
    priority: int
    expiry_date: Optional[str] = None
    usage_limit: int

class PlacementRequest(BaseModel):
    item_id: str
    container_id: str
    
    @validator('item_id')
    def validate_item_id(cls, v):
        if not v:
            raise ValueError("item_id is required")
        return v
        
    @validator('container_id')
    def validate_container_id(cls, v):
        if not v:
            raise ValueError("container_id is required")
        return v

class FastForwardRequest(BaseModel):
    days: int

class SetDateRequest(BaseModel):
    date: str

@app.get("/")
async def root():
    return {"message": "ISS Cargo System API", "status": "operational"}

@app.get("/api/items")
async def get_items():
    """Get all items"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM items")
        items = [dict(row) for row in cursor.fetchall()]
        return {"items": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@app.get("/api/containers")
async def get_containers():
    """Get all containers"""
    try:
        print("DEBUG: Getting containers")
        conn = get_db()
        cursor = conn.cursor()
        
        # Get all containers
        cursor.execute("SELECT * FROM containers")
        containers = [dict(row) for row in cursor.fetchall()]
        print(f"DEBUG: Returning {len(containers)} containers")
        return {"containers": containers}
        
    except Exception as e:
        print(f"ERROR: Failed to get containers: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@app.post("/api/items/place")
async def place_item(item_id: str, container_id: str):
    """Place an item in a container"""
    conn = None
    try:
        # Get database connection
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if item exists and is available
        cursor.execute("""
            SELECT id, status, container_id, expiry_date, usage_count, usage_limit, priority
            FROM items
            WHERE id = ?
        """, (item_id,))
        item = cursor.fetchone()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        if item[1] == "placed":
            raise HTTPException(status_code=400, detail="Item is already placed in a container")
            
        # Check if container exists
        cursor.execute("""
            SELECT container_id, width_cm, height_cm, depth_cm
            FROM containers
            WHERE container_id = ?
        """, (container_id,))
        container = cursor.fetchone()
        if not container:
            raise HTTPException(status_code=404, detail="Container not found")
            
        # Get item dimensions
        cursor.execute("""
            SELECT width, height, depth
            FROM items
            WHERE id = ?
        """, (item_id,))
        item_dimensions = cursor.fetchone()
        if not item_dimensions:
            raise HTTPException(status_code=404, detail="Item dimensions not found")
        
        dimensions = Dimensions(float(item_dimensions[0]), float(item_dimensions[1]), float(item_dimensions[2]))

        # Check if item fits in container
        if (dimensions.width > float(container[1]) or
            dimensions.height > float(container[2]) or
            dimensions.depth > float(container[3])):
            raise HTTPException(status_code=400, detail="Item is too large for container")

        # Get all items currently in the container
        cursor.execute("""
            SELECT x, y, z, width, height, depth, priority
            FROM items
            WHERE container_id = ? AND status = 'placed'
            ORDER BY priority DESC
        """, (container_id,))
        placed_items = cursor.fetchall()

        # Try to use cached layout first
        cached_layout = get_cached_container_layout(container_id)
        if cached_layout:
            # Check if the cached layout matches current state
            cursor.execute("""
                SELECT id, x, y, z, width, height, depth
                FROM items
                WHERE container_id = ? AND status = 'placed'
            """, (container_id,))
            current_items = cursor.fetchall()
            current_layout = {
                str(item[0]): {
                    'x': item[1],
                    'y': item[2],
                    'z': item[3],
                    'width': item[4],
                    'height': item[5],
                    'depth': item[6]
                }
                for item in current_items
            }
            
            if current_layout == cached_layout:
                # Use cached layout for position search
                best_position = find_position_with_cache(
                    dimensions,
                    cached_layout,
                    float(container[1]),
                    float(container[2]),
                    float(container[3]),
                    item[5]  # item priority
                )
            else:
                # Cache is outdated, clear it
                clear_container_layout_cache(container_id)
                best_position = find_position(
                    dimensions,
                    placed_items,
                    float(container[1]),
                    float(container[2]),
                    float(container[3]),
                    item[5]  # item priority
                )
        else:
            # No cache, find position normally
            best_position = find_position(
                dimensions,
                placed_items,
                float(container[1]),
                float(container[2]),
                float(container[3]),
                item[5]  # item priority
            )

        if best_position is None:
            raise HTTPException(status_code=400, detail="No valid position found in container")

        # Update item record with the found position
        cursor.execute("""
            UPDATE items 
            SET container_id = ?, x = ?, y = ?, z = ?, status = 'placed'
            WHERE id = ?
        """, (container_id, best_position.x, best_position.y, best_position.z, item_id))

        # Update container load
        cursor.execute("""
            UPDATE containers 
            SET current_load = current_load + (
                SELECT weight FROM items WHERE id = ?
            )
            WHERE container_id = ?
        """, (item_id, container_id))

        # Update cache with new layout
        cursor.execute("""
            SELECT id, x, y, z, width, height, depth
            FROM items
            WHERE container_id = ? AND status = 'placed'
        """, (container_id,))
        current_items = cursor.fetchall()
        update_container_layout_cache(container_id, [
            {
                'id': item[0],
                'x': item[1],
                'y': item[2],
                'z': item[3],
                'width': item[4],
                'height': item[5],
                'depth': item[6]
            }
            for item in current_items
        ])

        # Log the placement
        cursor.execute("""
            INSERT INTO logs (timestamp, action, item_id, container_id, details)
            VALUES (?, 'place', ?, ?, ?)
        """, (datetime.now().isoformat(), item_id, container_id, 
              f"Placed at position ({best_position.x}, {best_position.y}, {best_position.z})"))
        
        conn.commit()
        
        # Get updated item and container data
        cursor.execute("SELECT * FROM items WHERE id = ?", (item_id,))
        updated_item = cursor.fetchone()
        cursor.execute("SELECT * FROM containers WHERE container_id = ?", (container_id,))
        updated_container = cursor.fetchone()

        # Create response dictionaries with proper column names
        item_dict = {}
        container_dict = {}
        
        # Get column names for items table
        cursor.execute("PRAGMA table_info(items)")
        item_columns = [col[1] for col in cursor.fetchall()]
        
        # Get column names for containers table
        cursor.execute("PRAGMA table_info(containers)")
        container_columns = [col[1] for col in cursor.fetchall()]
        
        # Map values to column names
        for idx, col in enumerate(item_columns):
            item_dict[col] = updated_item[idx]
            
        for idx, col in enumerate(container_columns):
            container_dict[col] = updated_container[idx]
        
        return {
            "message": "Item placed successfully",
            "item": item_dict,
            "container": container_dict
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error placing item: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to place item: {str(e)}")
    finally:
        if conn:
            conn.close()

def find_position_with_cache(dimensions: Dimensions, cached_layout: Dict[str, Dict], 
                           container_width: float, container_height: float, container_depth: float,
                           item_priority: int) -> Optional[Position]:
    """Find a position using cached layout"""
    # Convert cached layout to list of placed items
    placed_items = []
    for item_data in cached_layout.values():
        placed_items.append((
            item_data['x'],
            item_data['y'],
            item_data['z'],
            item_data['width'],
            item_data['height'],
            item_data['depth'],
            item_priority  # Use same priority as new item for consistency
        ))
    
    return find_position(dimensions, placed_items, container_width, container_height, container_depth, item_priority)

def find_position(dimensions: Dimensions, placed_items: List[Tuple], 
                 container_width: float, container_height: float, container_depth: float,
                 item_priority: int) -> Optional[Position]:
    """Find a position for an item in a container"""
    # Start from the front corner (min x,y,z) for high priority items, back corner for low priority
    best_position = None
    min_distance = float('inf')

    # Increase step size from 0.5cm to 2cm for faster placement
    STEP_SIZE = 2.0  # cm

    # Determine search direction based on priority
    # Higher priority items (lower numbers) start from the front
    # Lower priority items (higher numbers) start from the back
    x_range = range(0, int((container_width - dimensions.width) / STEP_SIZE) + 1) if item_priority <= 3 else range(int((container_width - dimensions.width) / STEP_SIZE), -1, -1)
    y_range = range(0, int((container_height - dimensions.height) / STEP_SIZE) + 1) if item_priority <= 3 else range(int((container_height - dimensions.height) / STEP_SIZE), -1, -1)
    z_range = range(0, int((container_depth - dimensions.depth) / STEP_SIZE) + 1) if item_priority <= 3 else range(int((container_depth - dimensions.depth) / STEP_SIZE), -1, -1)

    # Try positions
    for x in x_range:
        for y in y_range:
            for z in z_range:
                # Convert to actual coordinates using new step size
                actual_x = x * STEP_SIZE
                actual_y = y * STEP_SIZE
                actual_z = z * STEP_SIZE

                # Check if position is valid
                position_valid = True
                has_support = False

                # Check for overlaps with other items
                for placed_item in placed_items:
                    if (actual_x < placed_item[0] + placed_item[3] and
                        actual_x + dimensions.width > placed_item[0] and
                        actual_y < placed_item[1] + placed_item[4] and
                        actual_y + dimensions.height > placed_item[1] and
                        actual_z < placed_item[2] + placed_item[5] and
                        actual_z + dimensions.depth > placed_item[2]):
                        position_valid = False
                        break

                    # Check for support behind the item
                    if item_priority > 3:  # Only check support for lower priority items
                        # Check if there's an item or wall behind
                        if (abs(actual_z + dimensions.depth - placed_item[2]) < STEP_SIZE and  # Item is right behind
                            actual_x < placed_item[0] + placed_item[3] and
                            actual_x + dimensions.width > placed_item[0] and
                            actual_y < placed_item[1] + placed_item[4] and
                            actual_y + dimensions.height > placed_item[1]):
                            has_support = True
                            break

                # For lower priority items, require support unless at the back wall
                if item_priority > 3 and not has_support and actual_z + dimensions.depth < container_depth - STEP_SIZE:
                    position_valid = False

                if position_valid:
                    # Calculate distance to target (front for high priority, back for low priority)
                    if item_priority <= 3:
                        # Distance to front for high priority items
                        distance = (actual_x**2 + actual_y**2 + actual_z**2)**0.5
                    else:
                        # Distance to back for low priority items
                        distance = (
                            (container_width - (actual_x + dimensions.width))**2 +
                            (container_height - (actual_y + dimensions.height))**2 +
                            (container_depth - (actual_z + dimensions.depth))**2
                        )**0.5

                    if distance < min_distance:
                        min_distance = distance
                        best_position = Position(actual_x, actual_y, actual_z)

    return best_position

@app.get("/api/items/retrieval_info")
async def get_retrieval_info(item_id: str):
    """Get information about how to retrieve an item"""
    conn = None
    try:
        # Get database connection
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if item exists and is placed
        cursor.execute("""
            SELECT id, container_id, x, y, z, status
            FROM items
            WHERE id = ?
        """, (item_id,))
        item = cursor.fetchone()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        
        if item[5] != "placed":
            raise HTTPException(status_code=400, detail="Item is not placed in any container")
            
        container_id = item[1]
        position = Position(float(item[2]), float(item[3]), float(item[4]))

        # Initialize space optimizer if needed
        if not space_optimizer.containers:
            space_optimizer.initialize_from_db(conn)

        # Get container dimensions
        cursor.execute("""
            SELECT width_cm, height_cm, depth_cm
            FROM containers
            WHERE container_id = ?
        """, (container_id,))
        container = cursor.fetchone()
        if not container:
            raise HTTPException(status_code=404, detail="Container not found")

        # Get item dimensions
        cursor.execute("""
            SELECT width, height, depth
            FROM items
            WHERE id = ?
        """, (item_id,))
        item_dimensions = cursor.fetchone()
        if not item_dimensions:
            raise HTTPException(status_code=404, detail="Item dimensions not found")

        dimensions = Dimensions(float(item_dimensions[0]), float(item_dimensions[1]), float(item_dimensions[2]))

        # Create item placement
        placement = ItemPlacement(item_id, position, dimensions)

        # Get blocking items
        blocking_items = []
        for other_id, other_placement in space_optimizer.containers[container_id].items.items():
            if other_id != item_id:
                other_min, other_max = other_placement.get_bounds()
                item_min, item_max = placement.get_bounds()
                
                # Check if item is above or in front of target
                if (other_min.y >= item_max.y and  # Above
                    other_min.x < item_max.x and other_max.x > item_min.x and
                    other_min.z < item_max.z and other_max.z > item_min.z):
                    blocking_items.append(other_id)
                elif (other_min.z < item_max.z and  # In front
                    other_min.x < item_max.x and other_max.x > item_min.x and
                    other_min.y < item_max.y and other_max.y > item_min.y):
                    blocking_items.append(other_id)

        # Get details of blocking items
        blocking_items_details = []
        for blocking_id in blocking_items:
            cursor.execute("""
                SELECT id, name, container_id, x, y, z
                FROM items
                WHERE id = ?
            """, (blocking_id,))
            blocking_item = cursor.fetchone()
            if blocking_item:
                blocking_items_details.append({
                    "id": blocking_item[0],
                    "name": blocking_item[1],
                    "container_id": blocking_item[2],
                    "position": {
                        "x": blocking_item[3],
                        "y": blocking_item[4],
                        "z": blocking_item[5]
                    }
                })
        
        return {
            "item_id": item_id,
            "container_id": container_id,
            "position": {
                "x": position.x,
                "y": position.y,
                "z": position.z
            },
            "blocking_items": blocking_items_details
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error getting retrieval info: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@app.get("/api/containers/space-info/{container_id}")
async def get_container_space_info(container_id: str):
    """Get detailed information about container space usage"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Get container information
        cursor.execute("SELECT * FROM containers WHERE container_id = ?", (container_id,))
        container = cursor.fetchone()
        if not container:
            raise HTTPException(status_code=404, detail="Container not found")
            
        # Get items in container
        cursor.execute("""
            SELECT * FROM items 
            WHERE container_id = ? 
            ORDER BY z ASC, x ASC, y ASC
        """, (container_id,))
        
        items = [dict(row) for row in cursor.fetchall()]
        
        # Calculate space usage
        total_volume = container['width_cm'] * container['depth_cm'] * container['height_cm']
        used_volume = sum(
            item['width'] * item['depth'] * item['height']
            for item in items
        )
        usage_percentage = (used_volume / total_volume) * 100
        
        return {
            "container_id": container_id,
            "container_name": container['name'],
            "dimensions": {
                "width": container['width_cm'],
                "depth": container['depth_cm'],
                "height": container['height_cm']
            },
            "total_volume": total_volume,
            "used_volume": used_volume,
            "usage_percentage": usage_percentage,
            "items": items,
            "current_load": container['current_load']
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@app.get("/api/items/waste")
async def get_waste_items():
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Get only items that are explicitly marked as waste
        cursor.execute("""
            SELECT * FROM items 
            WHERE status = 'waste'
        """)
        waste_items = [dict(row) for row in cursor.fetchall()]
        
        # Log the waste check
        cursor.execute("""
            INSERT INTO logs (action, details)
            VALUES (?, ?)
        """, ('waste-check', f"Found {len(waste_items)} items marked as waste"))
        
        conn.commit()
        return {"waste_items": waste_items}
    except Exception as e:
        print(f"Error checking waste items: {str(e)}")
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@app.post("/api/items/waste/{item_id}")
async def mark_as_waste(item_id: int):
    try:
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if item exists
        cursor.execute("SELECT * FROM items WHERE id = ?", (item_id,))
        item = cursor.fetchone()
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
            
        # Update item status
        cursor.execute("""
            UPDATE items 
            SET status = 'waste', container_id = NULL 
            WHERE id = ?
        """, (item_id,))
        
        # Log the action
        cursor.execute("""
            INSERT INTO logs (action, item_id, details)
            VALUES (?, ?, ?)
        """, ('mark-waste', item_id, f"Item {item_id} marked as waste"))
        
        conn.commit()
        
        # Get updated item data
        cursor.execute("SELECT * FROM items WHERE id = ?", (item_id,))
        updated_item = dict(cursor.fetchone())
        
        return {
            "message": "Item marked as waste successfully",
            "item": updated_item
        }
    except Exception as e:
        print(f"Error marking item as waste: {str(e)}")
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@app.get("/api/logs")
async def get_logs():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM logs ORDER BY timestamp DESC LIMIT 50")
        logs = [dict(row) for row in cursor.fetchall()]
        return {"logs": logs}
    except Exception as e:
        print(f"Error fetching logs: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        conn.close()

@app.post("/api/items/retrieve")
async def retrieve_item(item_id: str = Query(..., description="The ID of the item to retrieve")):
    """Retrieve an item from its container"""
    try:
        print(f"DEBUG: Retrieving item with ID: {item_id}")
        conn = get_db()
        cursor = conn.cursor()
        
        # Check if item exists and is placed
        cursor.execute("SELECT * FROM items WHERE item_id = ? OR id = ?", (item_id, item_id))
        item = cursor.fetchone()
        print(f"DEBUG: Found item: {dict(item) if item else None}")
        if not item:
            raise HTTPException(status_code=404, detail=f"Item with ID {item_id} not found")
        if item['container_id'] is None:
            raise HTTPException(status_code=400, detail=f"Item {item_id} is not placed in any container. Please place the item first before retrieving it.")
            
        # Get container information
        container_id = item['container_id']
        cursor.execute("SELECT * FROM containers WHERE container_id = ?", (container_id,))
        container = cursor.fetchone()
        print(f"DEBUG: Found container: {dict(container) if container else None}")
        
        # Update item status and increment usage_count
        print(f"DEBUG: Updating usage_count for item {item_id}")
        new_usage_count = min(item['usage_count'] + 1, item['usage_limit'])
        print(f"DEBUG: New usage count will be: {new_usage_count} (current: {item['usage_count']}, limit: {item['usage_limit']})")
        
        cursor.execute("""
            UPDATE items 
            SET container_id = NULL,
                x = NULL,
                y = NULL,
                z = NULL,
                rotation = NULL,
                status = 'available',
                usage_count = ?
            WHERE item_id = ? OR id = ?
        """, (new_usage_count, item_id, item_id))
        print(f"DEBUG: Successfully updated usage_count for item {item_id} to {new_usage_count}")
        
        # Update container load
        cursor.execute("""
            UPDATE containers 
            SET current_load = current_load - 1 
            WHERE container_id = ?
        """, (container_id,))
        
        # Log the action
        cursor.execute("""
            INSERT INTO logs (action, item_id, container_id, details)
            VALUES (?, ?, ?, ?)
        """, ('retrieve', item_id, container_id, 
              f"Retrieved item {item_id} from container {container_id}"))
        
        conn.commit()
        
        # Get updated data
        cursor.execute("SELECT * FROM items WHERE item_id = ? OR id = ?", (item_id, item_id))
        updated_item = dict(cursor.fetchone())
        cursor.execute("SELECT * FROM containers WHERE container_id = ?", (container_id,))
        updated_container = dict(cursor.fetchone())
        
        print(f"DEBUG: Returning updated item: {updated_item}")
        print(f"DEBUG: Returning updated container: {updated_container}")
        
        return {
            "message": "Item retrieved successfully",
            "item": updated_item,
            "container": updated_container
        }
    except HTTPException as he:
        print(f"DEBUG: HTTP Exception in retrieve_item: {str(he)}")
        if conn:
            conn.rollback()
        raise he
    except Exception as e:
        print(f"DEBUG: Error retrieving item: {str(e)}")
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@app.delete("/api/logs/clear")
async def clear_logs():
    """Clear all logs from the database"""
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM logs")
        conn.commit()
        return {"message": "All logs cleared successfully"}
    except Exception as e:
        print(f"Error clearing logs: {str(e)}")
        if conn:
            conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@app.get("/api/current-date")
async def get_system_date():
    try:
        current_date = get_current_date()
        return {
            "current_date": current_date.isoformat()
        }
    except Exception as e:
        print(f"Error getting current date: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def get_current_date():
    """Get the current system date from database"""
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT value FROM system_settings WHERE key = "current_date"')
        result = cursor.fetchone()
        if not result:
            # If no date is set, initialize with current date
            current_date = datetime.now().date()
            cursor.execute('INSERT INTO system_settings (key, value) VALUES (?, ?)',
                         ('current_date', current_date.isoformat()))
            conn.commit()
            return current_date
            
        date_str = result['value']
        return datetime.strptime(date_str, "%Y-%m-%d").date()
    except Exception as e:
        print(f"DEBUG: Error getting current date: {str(e)}")
        # Return today's date as fallback
        return datetime.now().date()
    finally:
        conn.close()

def set_current_date(new_date):
    """Set the current system date in database"""
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute('UPDATE system_settings SET value = ? WHERE key = "current_date"',
                      (new_date.isoformat(),))
        if cursor.rowcount == 0:
            cursor.execute('INSERT INTO system_settings (key, value) VALUES (?, ?)',
                         ('current_date', new_date.isoformat()))
        conn.commit()
    except Exception as e:
        print(f"DEBUG: Error setting current date: {str(e)}")
        conn.rollback()
        raise
    finally:
        conn.close()

def check_item_expiry(item_id):
    """Check if an item is expired based on current system date"""
    conn = get_db()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT id, name, expiry_date, status
            FROM items
            WHERE id = ? AND status != 'waste'
        """, (item_id,))
        item = cursor.fetchone()
        
        if not item or not item['expiry_date']:
            return False
            
        expiry_date = datetime.strptime(item['expiry_date'].split('T')[0], "%Y-%m-%d").date()
        current_date = get_current_date()
        
        if current_date > expiry_date:
            # Mark as waste and log
            cursor.execute("""
                UPDATE items
                SET status = 'waste',
                    container_id = NULL,
                    x = NULL,
                    y = NULL,
                    z = NULL,
                    rotation = NULL
                WHERE id = ?
            """, (item_id,))
            
            cursor.execute("""
                INSERT INTO logs (item_id, action, timestamp, details)
                VALUES (?, ?, ?, ?)
            """, (item_id, "Item expired", datetime.now().isoformat(),
                 f"Item {item['name']} (ID: {item_id}) expired on {current_date.isoformat()}"))
            
            conn.commit()
            return True
        return False
    finally:
        conn.close()

@app.post("/api/fast-forward")
async def fast_forward(request: FastForwardRequest):
    try:
        print(f"Received fast-forward request for {request.days} days")
        current_date = get_current_date()
        new_date = current_date + timedelta(days=request.days)
        set_current_date(new_date)
        print(f"Updated current_date to: {new_date}")
        
        # Check for expired items
        conn = get_db()
        cursor = conn.cursor()
        
        try:
            # Get all non-waste items with expiry dates
            cursor.execute("""
                SELECT id
                FROM items
                WHERE expiry_date IS NOT NULL AND status != 'waste'
            """)
            items = cursor.fetchall()
            print(f"Found {len(items)} items to check for expiration")
            
            expired_items = []
            for item in items:
                if check_item_expiry(item['id']):
                    expired_items.append(item['id'])
            
            print(f"Found {len(expired_items)} expired items")
            return {
                "new_date": new_date.isoformat(),
                "expired_items": expired_items
            }
        finally:
            conn.close()
    except Exception as e:
        print(f"Error in fast-forward endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fast forward time: {str(e)}")

@app.post("/api/set-date")
async def set_date(request: SetDateRequest):
    try:
        print(f"DEBUG: Attempting to set date to {request.date}")
        conn = get_db()
        cursor = conn.cursor()
        
        try:
            # Parse and validate the date
            try:
                new_date = datetime.strptime(request.date, "%Y-%m-%d").date()
                print(f"DEBUG: Parsed date to {new_date}")
            except ValueError as e:
                print(f"DEBUG: Date parsing error: {e}")
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

            # Update the date in system_settings
            print("DEBUG: Updating system_settings")
            cursor.execute('UPDATE system_settings SET value = ? WHERE key = "current_date"',
                         (new_date.isoformat(),))
            
            if cursor.rowcount == 0:
                print("DEBUG: No existing date found, inserting new one")
                cursor.execute('INSERT INTO system_settings (key, value) VALUES (?, ?)',
                             ('current_date', new_date.isoformat()))
            
            # If setting date to April 6th, reset all items
            if request.date == '2025-04-06':
                print("DEBUG: Resetting items for April 6th")
                cursor.execute("""
                    UPDATE items 
                    SET status = 'available',
                        container_id = NULL,
                        x = NULL,
                        y = NULL,
                        z = NULL,
                        rotation = NULL,
                        usage_count = 0
                """)
                
                cursor.execute("""
                    INSERT INTO logs (action, details)
                    VALUES (?, ?)
                """, ('reset-items', 'Reset all items to original state due to date reset to 2025-04-06'))
            
            conn.commit()
            print(f"DEBUG: Successfully set date to {new_date}")
            
            return {
                "message": "Date set successfully",
                "new_date": new_date.isoformat()
            }
            
        except Exception as e:
            print(f"DEBUG: Database error: {str(e)}")
            conn.rollback()
            raise
        finally:
            conn.close()
            
    except HTTPException as he:
        print(f"DEBUG: HTTP Exception: {str(he)}")
        raise
    except Exception as e:
        print(f"DEBUG: Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to set date: {str(e)}")

@app.post("/api/import/containers")
async def import_containers(file: UploadFile = File(...)):
    try:
        print("DEBUG: Starting container import process")
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")
            
        # Read CSV file
        print("DEBUG: Reading CSV file")
        contents = await file.read()
        csv_data = contents.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_data))
        
        # Process each row
        containers_added = 0
        conn = get_db()
        cursor = conn.cursor()
        
        try:
            # Clear existing containers except waste containers
            print("DEBUG: Clearing existing containers (preserving waste containers)")
            cursor.execute("DELETE FROM containers WHERE zone != 'Waste_Storage'")
            
            print("DEBUG: Starting to process CSV rows")
            for row in csv_reader:
                try:
                    print(f"DEBUG: Processing row: {row}")
                    # Skip if this is a waste container (preserve existing ones)
                    if row['zone'] == 'Waste_Storage':
                        print(f"DEBUG: Skipping waste container {row['container_id']}")
                        continue

                    # Validate required fields
                    required_fields = ['zone', 'container_id', 'width_cm', 'depth_cm', 'height_cm']
                    if not all(field in row for field in required_fields):
                        missing_fields = [field for field in required_fields if field not in row]
                        print(f"DEBUG: Missing required fields: {', '.join(missing_fields)}")
                        print(f"DEBUG: Available fields: {list(row.keys())}")
                        continue
                        
                    # Convert numeric fields
                    try:
                        width = float(row['width_cm'])
                        depth = float(row['depth_cm'])
                        height = float(row['height_cm'])
                    except ValueError as ve:
                        print(f"DEBUG: Error converting dimensions: {ve}")
                        print(f"DEBUG: width_cm={row['width_cm']}, depth_cm={row['depth_cm']}, height_cm={row['height_cm']}")
                        continue
                    
                    print(f"DEBUG: Importing container - ID: {row['container_id']}, Zone: {row['zone']}")
                    print(f"DEBUG: Dimensions - Width: {width}, Depth: {depth}, Height: {height}")
                    
                    # Add container to database
                    try:
                        cursor.execute('''
                            INSERT INTO containers (zone, container_id, width_cm, depth_cm, height_cm, current_load)
                            VALUES (?, ?, ?, ?, ?, 0)
                        ''', (row['zone'], row['container_id'], width, depth, height))
                        containers_added += 1
                        print(f"DEBUG: Successfully added container {row['container_id']}")
                    except sqlite3.Error as sqle:
                        print(f"DEBUG: Database error while inserting container: {sqle}")
                        continue
                    
                except Exception as row_error:
                    print(f"DEBUG: Error processing container row: {row_error}")
                    print(f"DEBUG: Row data: {row}")
                    continue
                    
            conn.commit()
            print(f"DEBUG: Successfully imported {containers_added} containers")
            
            # Reinitialize the optimization system to include new containers
            print("DEBUG: Reinitializing optimization system")
            reinitialize_optimizer()
            
            return {
                "message": f"Successfully imported {containers_added} containers",
                "containers_added": containers_added
            }
            
        except Exception as process_error:
            print(f"DEBUG: Error during container processing: {process_error}")
            raise
        finally:
            conn.close()
            
    except Exception as e:
        print(f"DEBUG: Error in import_containers: {str(e)}")
        print(f"DEBUG: Error type: {type(e)}")
        import traceback
        print(f"DEBUG: Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/import/items")
async def import_items(file: UploadFile = File(...)):
    conn = None
    try:
        print("DEBUG: Starting items import process")
        if not file.filename.endswith('.csv'):
            raise HTTPException(status_code=400, detail="File must be a CSV")
            
        # Read CSV file
        print("DEBUG: Reading CSV file")
        contents = await file.read()
        csv_data = contents.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(csv_data))
        
        # Process all rows
        items_added = 0
        conn = get_db()
        cursor = conn.cursor()
        
        try:
            # First, clear existing items
            print("DEBUG: Clearing existing items")
            cursor.execute("DELETE FROM items")
            
            # Prepare the insert statement
            insert_sql = '''
                INSERT INTO items (
                    id,
                    name,
                    width,
                    height,
                    depth,
                    weight,
                    priority,
                    expiry_date,
                    usage_limit,
                    preferred_zone,
                    status,
                    usage_count
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', 0)
            '''
            
            print("DEBUG: Starting to process items")
            for row in csv_reader:
                try:
                    # Map CSV columns to database fields using exact column names from CSV
                    item_id = row['item_id']
                    name = row['name']
                    width = float(row['width_cm'])
                    height = float(row['height_cm'])
                    depth = float(row['depth_cm'])
                    mass = float(row['mass_kg'])
                    priority = int(row['priority'])
                    expiry_date = row['expiry_date']
                    usage_limit = int(row['usage_limit'])
                    preferred_zone = row['preferred_zone']
                    
                    # Handle N/A expiry dates
                    if expiry_date == 'N/A':
                        expiry_date = None
                    else:
                        # Parse expiry date
                        expiry_date = datetime.strptime(expiry_date, '%Y-%m-%d').date()
                    
                    # Insert item into database
                    cursor.execute(insert_sql, (
                        item_id,  # Use item_id as the primary key
                        name,
                        width,
                        height,
                        depth,
                        mass,
                        priority,
                        expiry_date,
                        usage_limit,
                        preferred_zone
                    ))
                    items_added += 1
                    
                    if items_added % 100 == 0:
                        print(f"DEBUG: Imported {items_added} items so far")
                    
                except Exception as e:
                    print(f"DEBUG: Error processing item {row.get('item_id', 'unknown')}: {str(e)}")
                    continue
            
            # Commit all changes at once
            conn.commit()
            print(f"DEBUG: Successfully imported {items_added} items")
            
            return {"message": f"Successfully imported {items_added} items"}
            
        except Exception as e:
            if conn:
                conn.rollback()
            raise HTTPException(status_code=500, detail=f"Failed to import items: {str(e)}")
            
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"DEBUG: Error importing items: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if conn:
            conn.close()

@app.get("/api/optimizer/status")
async def get_optimizer_status():
    """Get the current status of the space optimizer"""
    try:
        # Count items and containers
        container_info = []
        for container_id, container in space_optimizer.containers.items():
            container_info.append({
                "container_id": container_id,
                "dimensions": {
                    "width": container.dimensions.width,
                    "depth": container.dimensions.depth,
                    "height": container.dimensions.height
                },
                "items_count": len(container.items),
                "items": [
                    {
                        "item_id": item.item_id,
                        "position": {
                            "x": item.position.x,
                            "y": item.position.y,
                            "z": item.position.z
                        },
                        "rotation": item.rotation
                    }
                    for item in container.items
                ]
            })

        return {
            "status": "active" if space_optimizer.containers else "not_initialized",
            "containers_count": len(space_optimizer.containers),
            "items_count": len(space_optimizer.items),
            "containers": container_info
        }
    except Exception as e:
        print(f"ERROR: Failed to get optimizer status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)