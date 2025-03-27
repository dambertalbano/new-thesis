import jwt from 'jsonwebtoken';

// student authentication middleware
const authStudent = (req, res, next) => {
    // Get token from the Authorization header (Bearer token)
    const token = req.header('Authorization')?.replace('Bearer ', ''); // Assumes 'Bearer <token>' format

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authorized, login again' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, message: 'Invalid token' });
        } else {
            req.student = decoded;
            next();
        }
    });
};

export default authStudent;