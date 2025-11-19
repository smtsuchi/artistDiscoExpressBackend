# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Artist Disco is a Node.js/Express REST API backend that serves a React frontend for discovering artists through Spotify integration. The backend manages user data, artist categories, and user preferences stored in MongoDB. The entire API implementation is contained within `server.js`.

Frontend repository: https://github.com/smtsuchi/artistDiscoReactFrontend

## Development Commands

### Running the application
```bash
# Production mode
npm start

# Development mode (with auto-restart)
npm run server
```

### Installation
```bash
npm install
```

## Architecture

### Monolithic Structure
All application logic exists in two files:
- `server.js` - Complete Express app with all API endpoints (500+ lines)
- `dbModel.js` - Mongoose schemas for User and Category data models

### Database Configuration
- MongoDB Atlas cluster (hardcoded connection string in server.js:49)
- Database: `artistDiscoDB`
- Single collection: `userData`

### Environment Variables
Required in `.env` file:
- `client_id` - Spotify OAuth client ID
- `client_secret` - Spotify OAuth client secret
- `redirect_uri` - Spotify OAuth redirect URI
- `PORT` - Server port (defaults to 5000)

### Data Model Architecture

**User Document:**
- `user_id` (String, required) - Spotify user ID
- `access_token` (String) - Spotify API access token
- `my_playlist` (String) - User's playlist ID
- `category_names` (Array[String]) - List of category names
- `category_data` (Array[Category]) - Full category objects
- `settings` (Object) - User preferences

**Category Sub-document:**
- `category_name` (String, required) - Category identifier
- `first_time` (Boolean) - Whether category has been initialized
- `artists` (Array[Object]) - Artist data from Spotify
- `buffer` (Array[String]) - Artist IDs to process
- `liked_count` (Number) - Count of liked artists
- `liked` (Array[String]) - Liked artist IDs
- `used` (Array[String]) - Already-processed artist IDs
- `visited` (Array[String]) - Viewed artist IDs
- `childRefs` (Array[Object]) - Related artist references

## API Endpoints

### User Endpoints
- `POST /userData` - Create new user with default settings
- `GET /userData/:user_id` - Retrieve full user document
- `GET /userData/settings/:user_id` - Retrieve only user settings

### Category Endpoints
- `POST /category/:user_id` - Create new category with initial buffer
- `GET /category/:user_id/:category_name` - Get category data, sets as current playlist
- `GET /category/single/:user_id/:category_name` - Get last artist in category
- `POST /patch-category/:user_id/:category_name` - Update category artists, used, and childRefs arrays
- `POST /patch-category-liked/:user_id/:category_name` - Add artist to liked array
- `POST /patch-category-leave-screen/:user_id/:category_name` - Update visited and artists arrays

### Settings Endpoints
- `POST /atp/:user_id` - Toggle "add to playlist on like" setting
- `POST /fav/:user_id` - Toggle "favorite on like" setting
- `POST /follow/:user_id` - Toggle "follow on like" setting

## Important Implementation Details

### Category Finding Pattern
Multiple endpoints use a linear search pattern to find categories:
```javascript
let pointer = 0;
for (let i=0; i<categories.length; i++) {
    if (categories[i].category_name == category_name) {
        pointer = i;
        break;
    }
}
```
This pattern is used in server.js:193, server.js:237, server.js:273, server.js:321, server.js:368.

### Settings Updates
Settings endpoints at server.js:407, server.js:438, and server.js:469 follow identical patterns - only the setting name varies.

### Current Playlist Behavior
When retrieving a category via `GET /category/:user_id/:category_name`, the backend automatically updates `settings.current_playlist` to that category name (server.js:201).

## Node.js Version
Requires Node.js 14.16.0 (specified in package.json engines field)
