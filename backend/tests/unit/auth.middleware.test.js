const authMiddleware = require('../../src/middleware/auth.middleware');
const jwt = require('jsonwebtoken');
const User = require('../../src/models/User.model');

jest.mock('../../src/models/User.model');

describe('Auth Middleware', () => {
    let req, res, next;

    beforeEach(() => {
        req = { headers: {} };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
        next = jest.fn();
        process.env.JWT_SECRET = 'test_secret';
    });

    it('should return 401 if no token provided', async () => {
        await authMiddleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token', async () => {
        req.headers.authorization = 'Bearer invalidtoken';
        await authMiddleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });

    it('should call next() for valid token', async () => {
        const token = jwt.sign({ id: 'user123' }, 'test_secret');
        req.headers.authorization = `Bearer ${token}`;
        User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue({ _id: 'user123', email: 'test@test.com', role: 'USER' }) });
        await authMiddleware(req, res, next);
        expect(next).toHaveBeenCalled();
        expect(req.user).toBeDefined();
    });

    it('should return 401 if user not found in DB', async () => {
        const token = jwt.sign({ id: 'ghost' }, 'test_secret');
        req.headers.authorization = `Bearer ${token}`;
        User.findById.mockReturnValue({ select: jest.fn().mockResolvedValue(null) });
        await authMiddleware(req, res, next);
        expect(res.status).toHaveBeenCalledWith(401);
    });
});
