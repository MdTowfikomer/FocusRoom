import { User as DefaultUser } from "../models/user_model.js";
import defaultBcrypt from "bcrypt";
import defaultJwt from "jsonwebtoken";

class UserService {
    /**
     * @param {Object} [deps] - Optional dependencies for testing
     * @param {import("../models/user_model.js").User} [deps.UserModel]
     * @param {import("bcrypt")} [deps.hasher]
     * @param {import("jsonwebtoken")} [deps.tokenManager]
     * @param {typeof fetch} [deps.fetcher]
     */
    constructor(deps = {}) {
        this.User = deps.UserModel || DefaultUser;
        this.bcrypt = deps.hasher || defaultBcrypt;
        this.jwt = deps.tokenManager || defaultJwt;
        this.fetch = deps.fetcher || fetch;
        
        this.jwtSecret = process.env.JWT_SECRET || 'fallback_insecure_secret';
    }

    async authenticate({ username, password }) {
        if (!username || !password) {
            const error = new Error("Please provide both username and password");
            error.statusCode = 400;
            throw error;
        }

        const user = await this.User.findOne({ username });
        if (!user) {
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            throw error;
        }

        const isPasswordCorrect = await this.bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            const error = new Error("Invalid credentials");
            error.statusCode = 401;
            throw error;
        }

        const token = this.jwt.sign(
            { id: user._id, username: user.username },
            this.jwtSecret,
            { expiresIn: '24h' }
        );

        return { token };
    }

    async register({ email, username, password }) {
        if (!email || !username || !password) {
            const error = new Error("Please provide all required fields");
            error.statusCode = 400;
            throw error;
        }

        if (password.length < 8) {
            const error = new Error("Password must be at least 8 characters long");
            error.statusCode = 400;
            throw error;
        }

        const existingUser = await this.User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            const error = new Error("Username or email already exists");
            error.statusCode = 409;
            throw error;
        }

        const hashedPassword = await this.bcrypt.hash(password, 10);
        const newUser = new this.User({
            email,
            username,
            password: hashedPassword
        });

        await newUser.save();
        return { message: "User Registered" };
    }

    async getIceServers() {
        try {
            const apiKey = process.env.METERED_API_KEY;
            const appName = process.env.METERED_APP_NAME;

            if (!apiKey || !appName) {
                return [{ urls: "stun:stun.l.google.com:19302" }];
            }

            const response = await this.fetch(
                `https://${appName}.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`
            );
            
            if (!response.ok) {
                throw new Error("Metered API returned error status");
            }
            
            return await response.json();
        } catch (error) {
            console.error("TURN Fetch Error:", error);
            return [{ urls: "stun:stun.l.google.com:19302" }];
        }
    }
}

export { UserService };
