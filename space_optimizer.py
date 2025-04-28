from typing import Dict, List, Optional, Tuple
from datetime import datetime
import sqlite3
from dataclasses import dataclass

@dataclass
class Position:
    x: float
    y: float
    z: float

    def __str__(self):
        return f"Position(x={self.x}, y={self.y}, z={self.z})"

@dataclass
class Dimensions:
    width: float
    height: float
    depth: float

    def get_volume(self) -> float:
        return self.width * self.height * self.depth

    def __str__(self):
        return f"Dimensions(width={self.width}, height={self.height}, depth={self.depth})"

class ItemPlacement:
    def __init__(self, item_id: str, position: Position, dimensions: Dimensions):
        self.item_id = item_id
        self.position = position
        self.dimensions = dimensions

    def get_bounds(self) -> Tuple[Position, Position]:
        """Returns (min_point, max_point) representing the item's bounds"""
        min_point = Position(
            self.position.x,
            self.position.y,
            self.position.z
        )
        max_point = Position(
            self.position.x + self.dimensions.width,
            self.position.y + self.dimensions.height,
            self.position.z + self.dimensions.depth
        )
        return (min_point, max_point)

class Container3D:
    def __init__(self, container_id: str, dimensions: Dimensions):
        self.container_id = container_id
        self.dimensions = dimensions
        self.items: Dict[str, ItemPlacement] = {}

    def can_place_item(self, item_placement: ItemPlacement) -> bool:
        """Check if an item can be placed at the specified position"""
        min_point, max_point = item_placement.get_bounds()
        
        # Check container bounds
        if (min_point.x < 0 or max_point.x > self.dimensions.width or
            min_point.y < 0 or max_point.y > self.dimensions.height or
            min_point.z < 0 or max_point.z > self.dimensions.depth):
            return False

        return True

    def place_item(self, item_placement: ItemPlacement) -> bool:
        """Place an item in the container if possible"""
        if self.can_place_item(item_placement):
            self.items[item_placement.item_id] = item_placement
            return True
        return False

class SpaceOptimizer:
    def __init__(self):
        self.containers: Dict[str, Container3D] = {}
        self.items: Dict[str, Tuple[Dimensions, str]] = {}

    def initialize_from_db(self, conn):
        """Initialize the space optimizer with data from the database"""
        cursor = conn.cursor()
        
        # Clear existing data
        self.containers.clear()
        self.items.clear()
        
        # Load containers
        cursor.execute("""
            SELECT container_id, width_cm, height_cm, depth_cm
            FROM containers
        """)
        for row in cursor.fetchall():
            container_id, width, height, depth = row
            dimensions = Dimensions(float(width), float(height), float(depth))
            self.containers[container_id] = Container3D(container_id, dimensions)

        # Load items with their dimensions and status
        cursor.execute("""
            SELECT id, width, height, depth, status
            FROM items
        """)
        for row in cursor.fetchall():
            item_id, width, height, depth, status = row
            dimensions = Dimensions(float(width), float(height), float(depth))
            self.items[item_id] = (dimensions, status)

    def find_optimal_placement(self, item_id: str, container_id: str) -> Tuple[Optional[Position], int]:
        """Find a position for an item in a container"""
        if item_id not in self.items or container_id not in self.containers:
            return None, 0

        item_dimensions, _ = self.items[item_id]
        container = self.containers[container_id]
        
        # Check if item fits in container
        if (item_dimensions.width > container.dimensions.width or
            item_dimensions.height > container.dimensions.height or
            item_dimensions.depth > container.dimensions.depth):
            return None, 0

        # Place at origin (0,0,0)
        position = Position(0, 0, 0)
        placement = ItemPlacement(item_id, position, item_dimensions)
        
        if container.can_place_item(placement):
            return position, 0
        
        return None, 0 