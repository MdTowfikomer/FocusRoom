import { User } from "../models/user_model.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


const login = async (req, res) => {
    const { username, password } = req.body; // get the credientials from the req body

    if (!username || !password) { // check you got the user/pass from the req body
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Please provide both username and password" });
    }

    const user = await User.findOne({ username }); // fetch user data from the DB using username

    if (!user) { // check user exist or not
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid credentials" })
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password); // check password is correct or not

    if (isPasswordCorrect) { // generate secure stateless JWT token
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET || 'fallback_insecure_secret',
            { expiresIn: '24h' }
        );

        return res.status(httpStatus.OK).json({ token }) 
    } else {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid credentials" }); 
    }
}


const register = async (req, res) => {
    const { email, username, password } = req.body; // get the crediatials 

    if (!email || !username || !password) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Please provide all required fields" });
    }

    if (password.length < 8) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Password must be at least 8 characters long" });
    }

    const existngUser = await User.findOne({ $or: [{ username }, { email }] }); // check user exists
    if (existngUser) {
        return res.status(httpStatus.CONFLICT).json({ message: "Username or email already exists" })
    }
    const hashedPassword = await bcrypt.hash(password, 10); // else hased there password
    const newUser = new User({ // make a user object 
        email,
        username,
        password: hashedPassword
    });

    await newUser.save(); // save in DB

    res.status(httpStatus.CREATED).json({ message: "User Registered" }); // return succefully registered..!!

}

const getTurnServers = async (req, res) => {
    try {
        const apiKey = process.env.METERED_API_KEY;
        const appName = process.env.METERED_APP_NAME;

        if (!apiKey || !appName) {
            // Fallback if not configured
            return res.status(httpStatus.OK).json([{ urls: "stun:stun.l.google.com:19302" }]);
        }

        const response = await fetch(
            `https://${appName}.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`
        );
        const meteredIceServers = await response.json();
        return res.status(httpStatus.OK).json(meteredIceServers);
    } catch (error) {
        console.error("TURN Fetch Error:", error);
        return res.status(httpStatus.OK).json([{ urls: "stun:stun.l.google.com:19302" }]);
    }
}

export { register, login, getTurnServers };