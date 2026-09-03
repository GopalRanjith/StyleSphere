const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'stylesphere_jwt_secret_key_2026';
const JWT_EXPIRES_IN = '24h';

function signToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

module.exports = {
    signToken,
    verifyToken
};
