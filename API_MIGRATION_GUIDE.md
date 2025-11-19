# Frontend API Migration Guide

## Overview
The backend API has been modernized with new RESTful endpoints. **All old endpoints still work**, so you can migrate gradually.

---

## API Endpoint Mapping

### User Endpoints

#### Create User
```javascript
// ✅ OLD (still works)
POST /userData
{
    "user_id": "spotify_user_123",
    "access_token": "BQA...",
    "my_playlist": "playlist_id"
}

// ⭐ NEW (recommended)
POST /api/users
{
    "user_id": "spotify_user_123",
    "access_token": "BQA...",
    "my_playlist": "playlist_id"
}

// Response format is now consistent:
{
    "success": true,
    "message": "User created successfully",
    "data": { ... }
}
```

#### Get User
```javascript
// ✅ OLD
GET /userData/:user_id

// ⭐ NEW
GET /api/users/:user_id
```

#### Get User Settings
```javascript
// ✅ OLD
GET /userData/settings/:user_id

// ⭐ NEW
GET /api/users/:user_id/settings
```

#### Update Settings (MAJOR CHANGE - Now Consolidated!)
```javascript
// ❌ OLD (3 separate endpoints - still work but deprecated)
POST /atp/:user_id
{ "value": true }

POST /fav/:user_id
{ "value": false }

POST /follow/:user_id
{ "value": true }

// ⭐ NEW (1 endpoint for all settings)
PATCH /api/users/:user_id/settings
{
    "setting": "add_to_playlist_on_like",  // or "fav_on_like" or "follow_on_like"
    "value": true
}

// Response:
{
    "success": true,
    "message": "Setting updated successfully",
    "data": {
        "setting": "add_to_playlist_on_like",
        "value": true
    }
}
```

---

### Category Endpoints

#### Create Category
```javascript
// ✅ OLD
POST /category/:user_id
{
    "category_name": "Electronic",
    "buffer": "artist_id1,artist_id2,artist_id3"
}

// ⭐ NEW
POST /api/users/:user_id/categories
{
    "category_name": "Electronic",
    "buffer": "artist_id1,artist_id2,artist_id3"
}
```

#### Get Category
```javascript
// ✅ OLD
GET /category/:user_id/:category_name

// ⭐ NEW
GET /api/users/:user_id/categories/:category_name
```

#### Get Current Artist (last in array)
```javascript
// ✅ OLD
GET /category/single/:user_id/:category_name

// ⭐ NEW
GET /api/users/:user_id/categories/:category_name/current
```

#### Update Category (patch artists, used, childRefs)
```javascript
// ✅ OLD
POST /patch-category/:user_id/:category_name
{
    "artists": [...],
    "used": [...],
    "child_refs": [...]
}

// ⭐ NEW
PATCH /api/users/:user_id/categories/:category_name
{
    "artists": [...],
    "used": [...],
    "child_refs": [...]
}
```

#### Add Liked Artist
```javascript
// ✅ OLD
POST /patch-category-liked/:user_id/:category_name
{
    "artist_id": "spotify_artist_123"
}

// ⭐ NEW
PATCH /api/users/:user_id/categories/:category_name/liked
{
    "artist_id": "spotify_artist_123"
}
```

#### Update on Leave Screen
```javascript
// ✅ OLD
POST /patch-category-leave-screen/:user_id/:category_name
{
    "visited": [...],
    "artists": [...]
}

// ⭐ NEW
PATCH /api/users/:user_id/categories/:category_name/leave
{
    "visited": [...],
    "artists": [...]
}
```

---

## Response Format Changes

### Before (Inconsistent)
```javascript
// Sometimes just the data
{ user_id: "123", ... }

// Sometimes with message
{
    "message": "Handling POST requests to /userData",
    "createdUser": { ... }
}

// Errors varied
{
    "error": err
}
// or
{
    "message": "hi",  // 😕
    "error": err
}
```

### After (Consistent)
```javascript
// Success responses
{
    "success": true,
    "data": { ... },
    "message": "Optional descriptive message"
}

// Error responses
{
    "success": false,
    "error": "User not found",
    "details": ["Additional info if available"]
}
```

---

## Error Handling Improvements

### HTTP Status Codes (Now Consistent)
- `200` - Success (GET)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Server Error

### Validation Errors (New!)
```javascript
// Example: Missing required field
POST /api/users
{
    "user_id": "123"
    // Missing access_token
}

// Response (400):
{
    "success": false,
    "error": "Validation Error",
    "details": [
        "\"access_token\" is required"
    ]
}
```

---

## Migration Strategy

### Phase 1: No Changes Required ✅
Keep using old endpoints. Everything still works!

### Phase 2: Gradual Migration (Recommended)
1. Update error handling to check `response.success`
2. Migrate one endpoint at a time
3. Update to new consolidated settings endpoint
4. Test thoroughly

### Phase 3: Full Modern API
All endpoints use `/api/*` structure

---

## Example: Settings Update Migration

### Old Code
```javascript
// Had to make 3 separate API calls
const updateSettings = async (userId, settings) => {
    if (settings.addToPlaylist !== undefined) {
        await fetch(`/atp/${userId}`, {
            method: 'POST',
            body: JSON.stringify({ value: settings.addToPlaylist })
        });
    }

    if (settings.favorite !== undefined) {
        await fetch(`/fav/${userId}`, {
            method: 'POST',
            body: JSON.stringify({ value: settings.favorite })
        });
    }

    if (settings.follow !== undefined) {
        await fetch(`/follow/${userId}`, {
            method: 'POST',
            body: JSON.stringify({ value: settings.follow })
        });
    }
};
```

### New Code (Better!)
```javascript
// One endpoint, cleaner code
const updateSetting = async (userId, setting, value) => {
    const response = await fetch(`/api/users/${userId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setting, value })
    });

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error);
    }

    return data.data;
};

// Usage
await updateSetting('user123', 'add_to_playlist_on_like', true);
await updateSetting('user123', 'fav_on_like', false);
```

---

## Breaking Changes

### ⚠️ None!

All old endpoints work. However, the **response format** is now more consistent. Update your error handling to check `response.success`.

---

## Request Validation (New Feature!)

All endpoints now validate input. Invalid requests return `400` with details:

```javascript
// Example: Invalid user creation
POST /api/users
{
    "user_id": "",  // Empty string not allowed
    "access_token": 123  // Should be string
}

// Response:
{
    "success": false,
    "error": "Validation Error",
    "details": [
        "\"user_id\" is not allowed to be empty",
        "\"access_token\" must be a string"
    ]
}
```

---

## CORS Changes

The backend now restricts CORS to `http://localhost:3000` (configurable via `FRONTEND_URL` env var).

If you're running the frontend on a different port/domain, update the backend's `.env`:
```bash
FRONTEND_URL=http://localhost:3001
```

---

## Testing the New API

### Health Check (New!)
```bash
curl http://localhost:5000/health

{
    "success": true,
    "message": "Artist Disco API is running",
    "timestamp": "2025-11-19T02:41:46.638Z"
}
```

### Test Endpoint (Updated)
```bash
curl http://localhost:5000/test

{
    "success": true,
    "message": "API test successful"
}
```

---

## Rate Limiting (New Feature!)

The API now has rate limiting:
- **Limit**: 100 requests per 15 minutes per IP
- **Scope**: Only `/api/*` endpoints
- **Response when exceeded**:
```json
{
    "success": false,
    "error": "Too many requests from this IP, please try again later."
}
```

Legacy endpoints (`/userData`, `/category`, etc.) are **not** rate limited for backward compatibility.

---

## Need Help?

1. Check the backend logs: `logs/combined.log`
2. Use the health endpoint to verify server is running
3. Test with curl/Postman before updating frontend code
4. Read `MODERNIZATION.md` for full technical details

---

## Summary

✅ **All old endpoints work** - No immediate changes required
⭐ **New modern endpoints available** - Cleaner, more RESTful
🔒 **Better security** - Validation, rate limiting, CORS
📊 **Consistent responses** - Easier error handling
🚀 **Production ready** - Professional architecture

Happy coding! 🎉
