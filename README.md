# PARKING LOCATION DETECTION SYSTEM IN BUILDINGS USING LICENSE PLATE RECOGNITION

## Overview
This project is a parking location detection system designed for buildings, utilizing license plate recognition. It consists of two main parts:

### Web Admin Panel
The web admin panel is used to manage parking lots and includes the following features:
- Real-time parking status tracking using WebSocket
- Dashboard summarizing system performance
- Search for vehicles by license plate and other attributes
- Search for parking spots by location
- Monitor and manage CCTV cameras
- View parking history and usage statistics
- Display parking slot availability by floor and parking lot
- Manage system access with JWT Token authentication

### Web User Panel
The web user panel allows users to search for their parked vehicles. Users can input their license plate number, province, and additional attributes such as color, brand, and parking time. The system then displays search results along with a map indicating the parking location.

## Technology Stack
- **Frontend:** Vite + React + TypeScript
- **UI Framework:** Tailwind CSS + Material UI

## Installation and Setup
Follow these steps to clone and set up the project:

1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd <project-folder>
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Run the development server:**
   ```sh
   npm run dev
   ```

4. **Access the application:**
   - The web admin panel and user panel will be available at the local development server URL (typically `http://localhost:5173` for Vite).

