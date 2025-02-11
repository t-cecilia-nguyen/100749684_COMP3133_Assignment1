const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const userResolvers = {
    Query: {
        async login(_, { username, password }) {
            // Validate the username and password
            if (!username || username.trim() === '') {
                throw new Error('Username is required');
            }
            if (!password || password.trim() === '') {
                throw new Error('Password is required');
            }

            // Find the user by username or email
            const user = await User.findOne({ $or: [{ username }, { email: username }] });
            if (!user) {
                throw new Error('User not found');
            }

            // Compare password
            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                throw new Error('Incorrect password');
            }

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

            return { token, user };
        },
    },

    Mutation: {
        signup: async (_, { username, email, password }) => {
            // Validation
            if (!username || username.trim() === '') {
                throw new Error('Username cannot be empty');
            }
            if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
                throw new Error('Please provide a valid email');
            }
            if (!password || password.trim() === '') {
                throw new Error('Password is required');
            }

            const existingUser = await User.findOne({ $or: [{ username }, { email }] });
            if (existingUser) throw new Error('User already exists');

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new User({ username, email, password: hashedPassword });
            await user.save();

            return user;
        },
    }
};

module.exports = userResolvers;
