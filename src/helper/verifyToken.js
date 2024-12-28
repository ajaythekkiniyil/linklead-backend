// Middleware to Protect Routes
export const verifyToken = (req, res, next) => {
    // const authHeader = req.headers.authorization;
    // if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

    // const token = authHeader.split(' ')[1];
    // try {
    //     const payload = jwt.verify(token, secretKey);
    //     req.user = payload; // Attach user data to request object
    //     next();
    // } catch (err) {
    //     res.status(403).json({ error: 'Forbidden' });
    // }
};
