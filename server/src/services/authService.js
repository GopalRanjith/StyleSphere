const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { signToken } = require('../utils/jwt');

async function login(email, password) {
    try {
        const [rows] = await db.execute(
            'SELECT id, email, password_hash, first_name, last_name FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            return { success: false, error: 'Invalid email or password' };
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return { success: false, error: 'Invalid email or password' };
        }

        const token = signToken({
            userId: user.id,
            email: user.email
        });

        return {
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            }
        };
    } catch (error) {
        throw error;
    }
}

async function register(email, password, firstName, lastName) {
    try {
        // Check if user exists
        const [existing] = await db.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existing.length > 0) {
            return { success: false, error: 'An account with this email already exists. Please log in.' };
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            'INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
            [email, passwordHash, firstName || '', lastName || '']
        );

        const userId = result.insertId;
        const token = signToken({
            userId,
            email
        });

        return {
            success: true,
            token,
            user: {
                id: userId,
                email,
                first_name: firstName,
                last_name: lastName
            }
        };
    } catch (error) {
        throw error;
    }
}

module.exports = {
    login,
    register
};
