# Kala-Kaart: AI-Powered Artisan Discovery Platform

[![Flask](https://img.shields.io/badge/Flask-2.3.0-blue?style=flat-square&logo=flask)](https://flask.palletsprojects.com/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0.2-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

Kala-Kaart is an AI-powered platform that connects customers with traditional Indian artisans through intelligent search and discovery. Using Google's Gemini AI, the platform enables natural language queries to find verified artisans across 28+ states in India.

## Features

### Core Functionality
- **AI-Powered Search**: Natural language processing for intuitive artisan discovery
- **Verified Database**: 50,000+ government-verified artisan profiles
- **Multi-Language Support**: Hindi, English, and regional language support
- **Direct Contact**: Phone and email integration for direct artisan communication
- **Real-Time Analytics**: Live statistics and insights dashboard

### Technical Capabilities
- **Smart Filtering**: Search by craft type, location, experience, and availability
- **Geographic Search**: State → District → Village hierarchy
- **Intent Recognition**: Understands complex user queries and requirements
- **Responsive Design**: Mobile-first approach with cross-platform compatibility

## Technology Stack

### Backend
- **Flask 2.3.0** - Web framework
- **Python 3.8+** - Backend language
- **Pandas** - Data processing
- **Google Generative AI** - AI integration
- **CSV Database** - Artisan data storage (50,000+ records)

### Frontend
- **React 18.2.0** - UI framework
- **TypeScript 5.0.2** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool

### Authentication & Storage
- **Firebase Auth** - User authentication
- **Firebase Firestore** - User profile storage
- **Google OAuth 2.0** - Social login

## Installation

### Prerequisites
- Node.js 18.x or higher
- Python 3.8 or higher
- Google AI API key
- Firebase project setup

### Backend Setup

1. **Clone and navigate to backend**
```bash
git clone https://github.com/AbhiramRaja/Local-Artisian_AI.git
cd Local-Artisian_AI/flask-server/backend
