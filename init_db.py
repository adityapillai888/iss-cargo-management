import sqlite3
from datetime import datetime
import json

def clear_items():
    conn = sqlite3.connect('iss_cargo.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM items')
    conn.commit()
    conn.close()
    print("All items cleared from database!")

def clear_containers():
    conn = sqlite3.connect('iss_cargo.db')
    cursor = conn.cursor()
    cursor.execute('DELETE FROM containers')
    conn.commit()
    conn.close()
    print("All containers cleared from database!")

def init_db():
    conn = sqlite3.connect('iss_cargo.db')
    cursor = conn.cursor()
    
    try:
        print("Initializing database...")
        
        # Drop existing tables
        cursor.execute('DROP TABLE IF EXISTS items')
        cursor.execute('DROP TABLE IF EXISTS containers')
        cursor.execute('DROP TABLE IF EXISTS system_settings')
        cursor.execute('DROP TABLE IF EXISTS logs')
        
        # Create containers table
        cursor.execute('''
            CREATE TABLE containers (
                container_id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                zone TEXT NOT NULL,
                width_cm REAL NOT NULL,
                depth_cm REAL NOT NULL,
                height_cm REAL NOT NULL,
                current_load INTEGER DEFAULT 0
            )
        ''')
        
        # Create items table
        cursor.execute('''
            CREATE TABLE items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                width REAL NOT NULL,
                height REAL NOT NULL,
                depth REAL NOT NULL,
                weight REAL NOT NULL,
                container_id TEXT,
                x REAL,
                y REAL,
                z REAL,
                rotation TEXT,
                status TEXT DEFAULT 'available',
                expiry_date TEXT,
                usage_count INTEGER DEFAULT 0,
                usage_limit INTEGER DEFAULT 0,
                priority INTEGER DEFAULT 1,
                FOREIGN KEY (container_id) REFERENCES containers (container_id)
            )
        ''')
        
        # Create system_settings table
        cursor.execute('''
            CREATE TABLE system_settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            )
        ''')
        
        # Create logs table
        cursor.execute('''
            CREATE TABLE logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                action TEXT NOT NULL,
                details TEXT,
                item_id INTEGER,
                container_id TEXT,
                FOREIGN KEY (item_id) REFERENCES items (id),
                FOREIGN KEY (container_id) REFERENCES containers (container_id)
            )
        ''')
        
        # Initialize current_date in system_settings
        current_date = datetime.now().date()
        cursor.execute('INSERT INTO system_settings (key, value) VALUES (?, ?)',
                     ('current_date', current_date.isoformat()))
        
        # Initialize container_id_map
        cursor.execute('INSERT INTO system_settings (key, value) VALUES (?, ?)',
                     ('container_id_map', '{}'))
        
        conn.commit()
        print("Database initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        conn.rollback()
        raise
    finally:
        conn.close()

if __name__ == "__main__":
    init_db()
    clear_items()
    clear_containers()