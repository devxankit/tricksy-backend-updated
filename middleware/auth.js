import jwt from 'jsonwebtoken';

const authMiddleware = (roles=[]) => {
    return (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        try {
            const jwtSecret = process.env.JWTSECRET || 'fallback-secret-key';
        const decoded = jwt.verify(token, jwtSecret);
            req.user = decoded; // Attach the decoded token to the request object
            // Check if the user's role is allowed to access the route
            if (roles.length && !roles.includes(req.user.role)) {
                return res.status(403).json({ message: 'Access denied' });
            }

            next(); // Call the next middleware or route handler
        } catch (error) {
            console.log("Error", error)
            res.status(401).json({ message: 'Token is not valid' });
        }
    };
}

export default authMiddleware;

