# Multi-Tenant Dashboard

This application is a demonstration of a multi-tenant architecture with subdomain-based tenant isolation, session management, and activity tracking.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Setup and Running](#setup-and-running)
- [Architecture](#architecture)
- [Authentication Flow](#authentication-flow)
- [Known Issues](#known-issues)
- [Development Notes](#development-notes)

## Overview

This dashboard application demonstrates a multi-tenant system where:

- Users can belong to multiple organizations (tenants)
- Each tenant has its own isolated subdomain
- User activity is tracked within each tenant session
- Inactive sessions expire automatically

## Features

- Subdomain-based multi-tenancy
- Session-based authentication
- User activity tracking and automatic session expiry
- Role-based access control (users can access only their authorized tenants)

## Setup and Running

### Prerequisites

- Node.js (v14 or higher)
- npm/yarn

### Environment Setup

For local development, the application uses `lvh.me` which resolves to 127.0.0.1, allowing for subdomain testing.

### Installation

1. Clone the repository
2. Install dependencies for both client and server:

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Running the Application

Start both the server and client:

```bash
# Terminal 1: Start the server
cd server
npm run start:dev

# Terminal 2: Start the client
cd client
npm run dev
```

### Accessing the Application

- Main application: http://myapp.lvh.me:5173
- Login page: http://login.myapp.lvh.me:5173
- Tenant subdomains: http://tenant1.myapp.lvh.me:5173, http://tenant2.myapp.lvh.me:5173, etc.

### Demo Accounts

- user1 / password1 (Access to Tenant 1)
- user2 / password2 (Access to Tenant 2)
- admin / admin123 (Access to all tenants)

## Architecture

The application consists of two main parts:

### Backend (NestJS)

- NestJS framework with Express
- Session-based authentication
- Middleware for tenant identification from subdomains
- Activity tracking service for session management

### Frontend (React)

- React with React Router
- Context API for state management
- Tailwind CSS for styling

## Authentication Flow

1. Users log in at login.myapp.lvh.me
2. After authentication, they view available tenants
3. When selecting a tenant, they're redirected to the tenant subdomain
4. **Note:** There's a known issue where users are prompted to log in again after tenant selection (see [Known Issues](#known-issues))
5. The tenant middleware identifies the tenant from the subdomain
6. The authentication context maintains user state
7. The activity context tracks user actions within the tenant session

## Known Issues

### Tenant Navigation Requires Re-login

When a user selects a tenant from the tenant selection page, they're redirected to the tenant subdomain but are prompted to log in again. This is due to session cookies not being properly shared across subdomains.

### Session Timeouts

For testing and demonstration purposes, the session timeout is set to **20 seconds** of inactivity (instead of a more realistic 20 minutes). This allows testers to easily observe the automatic session expiry functionality.

## Development Notes

### Multi-tenancy Implementation

The application uses a subdomain approach for multi-tenancy where each tenant gets their own subdomain (e.g., tenant1.myapp.lvh.me). The server extracts the subdomain from the hostname and identifies the current tenant.

### Security Considerations

- Session authentication with HTTP-only cookies
- Tenant isolation via subdomains
- Server-side verification of tenant access permissions
- Automatic session expiry after inactivity

### User Activity Tracking

The application tracks user activity (mouse movements, clicks, keyboard input) and maintains an active session only while the user is actively using the tenant dashboard.
