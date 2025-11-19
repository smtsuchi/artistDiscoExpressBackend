const request = require('supertest');
const express = require('express');
const User = require('../../dbModel');
const userRoutes = require('../../routes/userRoutes');
const { errorHandler } = require('../../middleware/errorHandler');
const { connect, closeDatabase, clearDatabase } = require('../setup/testDb');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);
app.use(errorHandler);

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('User API Integration Tests', () => {
    describe('POST /api/users', () => {
        it('should create a new user with valid data', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({
                    user_id: 'spotify_user_123',
                    access_token: 'BQA1234567890',
                    my_playlist: 'playlist_abc'
                })
                .expect(201);

            expect(response.body).toMatchObject({
                success: true,
                message: 'User created successfully',
                data: expect.objectContaining({
                    user_id: 'spotify_user_123',
                    access_token: 'BQA1234567890'
                })
            });

            // Verify in database
            const user = await User.findOne({ user_id: 'spotify_user_123' });
            expect(user).toBeTruthy();
            expect(user.my_playlist).toBe('playlist_abc');
        });

        it('should return 400 for missing required fields', async () => {
            const response = await request(app)
                .post('/api/users')
                .send({
                    user_id: 'spotify_user_123'
                    // Missing access_token
                })
                .expect(400);

            expect(response.body).toMatchObject({
                success: false,
                error: 'Validation Error'
            });
        });

        it('should return 400 for empty user_id', async () => {
            await request(app)
                .post('/api/users')
                .send({
                    user_id: '',
                    access_token: 'token123'
                })
                .expect(400);
        });
    });

    describe('GET /api/users/:user_id', () => {
        beforeEach(async () => {
            await User.create({
                user_id: 'test_user',
                access_token: 'test_token',
                category_names: ['Electronic', 'Rock']
            });
        });

        it('should get user by ID', async () => {
            const response = await request(app)
                .get('/api/users/test_user')
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                data: expect.objectContaining({
                    user_id: 'test_user',
                    category_names: ['Electronic', 'Rock']
                })
            });
        });

        it('should return 404 for non-existent user', async () => {
            const response = await request(app)
                .get('/api/users/nonexistent')
                .expect(404);

            expect(response.body).toMatchObject({
                success: false,
                error: 'User not found'
            });
        });
    });

    describe('GET /api/users/:user_id/settings', () => {
        beforeEach(async () => {
            await User.create({
                user_id: 'test_user',
                access_token: 'test_token',
                settings: {
                    fav_on_like: true,
                    follow_on_like: false,
                    add_to_playlist_on_like: true
                }
            });
        });

        it('should get user settings', async () => {
            const response = await request(app)
                .get('/api/users/test_user/settings')
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                data: {
                    fav_on_like: true,
                    follow_on_like: false,
                    add_to_playlist_on_like: true
                }
            });
        });
    });

    describe('PATCH /api/users/:user_id/settings', () => {
        beforeEach(async () => {
            await User.create({
                user_id: 'test_user',
                access_token: 'test_token'
            });
        });

        it('should update a setting', async () => {
            const response = await request(app)
                .patch('/api/users/test_user/settings')
                .send({
                    setting: 'fav_on_like',
                    value: false
                })
                .expect(200);

            expect(response.body).toMatchObject({
                success: true,
                message: 'Setting updated successfully',
                data: {
                    setting: 'fav_on_like',
                    value: false
                }
            });

            // Verify in database
            const user = await User.findOne({ user_id: 'test_user' });
            expect(user.settings.fav_on_like).toBe(false);
        });

        it('should return 400 for invalid setting name', async () => {
            await request(app)
                .patch('/api/users/test_user/settings')
                .send({
                    setting: 'invalid_setting',
                    value: false
                })
                .expect(400);
        });

        it('should return 400 for invalid value type', async () => {
            await request(app)
                .patch('/api/users/test_user/settings')
                .send({
                    setting: 'fav_on_like',
                    value: 'not a boolean'
                })
                .expect(400);
        });
    });
});
