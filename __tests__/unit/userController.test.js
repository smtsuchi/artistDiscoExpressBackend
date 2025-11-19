const User = require('../../dbModel');
const {
    createUser,
    getUserById,
    getUserSettings,
    updateUserSetting
} = require('../../controllers/userController');
const { connect, closeDatabase, clearDatabase } = require('../setup/testDb');

beforeAll(async () => await connect());
afterEach(async () => await clearDatabase());
afterAll(async () => await closeDatabase());

describe('User Controller', () => {
    describe('createUser', () => {
        it('should create a new user successfully', async () => {
            const req = {
                body: {
                    user_id: 'test_user_123',
                    access_token: 'test_token',
                    my_playlist: 'playlist_123'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            await createUser(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: 'User created successfully',
                    data: expect.objectContaining({
                        user_id: 'test_user_123',
                        access_token: 'test_token'
                    })
                })
            );
        });

        it('should call next with error if user creation fails', async () => {
            const req = {
                body: {
                    // Missing required fields
                    my_playlist: 'playlist_123'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            await createUser(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('getUserById', () => {
        it('should return user when found', async () => {
            // Create test user
            await User.create({
                user_id: 'test_user_123',
                access_token: 'test_token'
            });

            const req = {
                params: { user_id: 'test_user_123' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            await getUserById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        user_id: 'test_user_123'
                    })
                })
            );
        });

        it('should return 404 when user not found', async () => {
            const req = {
                params: { user_id: 'nonexistent_user' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            await getUserById(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: false,
                    error: 'User not found'
                })
            );
        });
    });

    describe('getUserSettings', () => {
        it('should return user settings when found', async () => {
            await User.create({
                user_id: 'test_user_123',
                access_token: 'test_token',
                settings: {
                    fav_on_like: true,
                    follow_on_like: false,
                    add_to_playlist_on_like: true
                }
            });

            const req = {
                params: { user_id: 'test_user_123' }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            await getUserSettings(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    data: expect.objectContaining({
                        fav_on_like: true,
                        follow_on_like: false
                    })
                })
            );
        });
    });

    describe('updateUserSetting', () => {
        it('should update a user setting successfully', async () => {
            await User.create({
                user_id: 'test_user_123',
                access_token: 'test_token'
            });

            const req = {
                params: { user_id: 'test_user_123' },
                body: {
                    setting: 'fav_on_like',
                    value: false
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            await updateUserSetting(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    success: true,
                    message: 'Setting updated successfully',
                    data: expect.objectContaining({
                        setting: 'fav_on_like',
                        value: false
                    })
                })
            );
        });

        it('should return 404 if user not found', async () => {
            const req = {
                params: { user_id: 'nonexistent_user' },
                body: {
                    setting: 'fav_on_like',
                    value: false
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();

            await updateUserSetting(req, res, next);

            expect(res.status).toHaveBeenCalledWith(404);
        });
    });
});
