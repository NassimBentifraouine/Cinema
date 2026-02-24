const authService = require('../../src/services/auth.service');
const User = require('../../src/models/User.model');
const jwt = require('jsonwebtoken');

jest.mock('../../src/models/User.model');

describe('Auth Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test_secret';
        process.env.JWT_EXPIRES_IN = '1d';
    });

    describe('register', () => {
        it('should throw 409 if email already exists', async () => {
            User.findOne.mockResolvedValue({ email: 'test@example.com' });
            await expect(authService.register({ email: 'test@example.com', password: 'Test@1234' }))
                .rejects.toMatchObject({ statusCode: 409 });
        });

        it('should return token and user on success', async () => {
            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue({ _id: 'abc123', email: 'new@example.com', role: 'USER' });
            const result = await authService.register({ email: 'new@example.com', password: 'Test@1234' });
            expect(result).toHaveProperty('token');
            expect(result.user.email).toBe('new@example.com');
        });
    });

    describe('login', () => {
        it('should throw 401 if user not found', async () => {
            User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
            await expect(authService.login({ email: 'nope@example.com', password: 'wrong' }))
                .rejects.toMatchObject({ statusCode: 401 });
        });

        it('should throw 401 if password is wrong', async () => {
            const mockUser = {
                _id: 'abc',
                email: 'test@example.com',
                role: 'USER',
                comparePassword: jest.fn().mockResolvedValue(false),
            };
            User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
            await expect(authService.login({ email: 'test@example.com', password: 'wrong' }))
                .rejects.toMatchObject({ statusCode: 401 });
        });

        it('should return token on valid credentials', async () => {
            const mockUser = {
                _id: 'abc',
                email: 'test@example.com',
                role: 'USER',
                comparePassword: jest.fn().mockResolvedValue(true),
            };
            User.findOne.mockReturnValue({ select: jest.fn().mockResolvedValue(mockUser) });
            const result = await authService.login({ email: 'test@example.com', password: 'Test@1234' });
            expect(result).toHaveProperty('token');
            expect(result.user.email).toBe('test@example.com');
        });
    });

    describe('generateToken', () => {
        it('should generate a valid JWT', () => {
            const token = authService.generateToken('userId123');
            const decoded = jwt.verify(token, 'test_secret');
            expect(decoded.id).toBe('userId123');
        });
    });
});
