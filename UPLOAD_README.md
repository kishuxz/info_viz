# Event Network Upload System

## Setup Instructions

### 1. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 2. Start the Backend Server

Open a new terminal and run:

```bash
cd backend
python converter.py
```

The Flask server will start on `http://127.0.0.1:5000`

### 3. Start the Frontend (if not already running)

In another terminal:

```bash
npm start
```

### 4. Access the Upload Panel

Navigate to: `http://localhost:3000/upload`

## Usage

1. **Select Files**: Click "Choose Files" and select one or more CSV or Excel files
2. **Choose Format**: Select either Gephi or Kumu format
3. **Convert**: Click the "Convert" button
4. **Download**: Download the generated nodes and edges CSV files

## File Format Requirements

Your CSV/Excel files should contain these columns (case-insensitive):

### Required:
- `orgName` - Organization name
- `eventId` - Event identifier  
- `eventName` - Event name
- `eventDate` - Event date

### Optional:
- `sector` - Organization sector
- `addressCity`, `addressState`, `addressCountry` - Location info
- `connections` - JSON array of connections between organizations

## Troubleshooting

- **CORS errors**: Make sure Flask backend is running on port 5000
- **File upload fails**: Check that Flask has write permissions for `backend/uploads/` and `backend/outputs/`
- **Missing dependencies**: Run `pip install -r requirements.txt` again
