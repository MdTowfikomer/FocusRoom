import { User } from "../models/user_model.js";
import httpStatus from "http-status";
import bcrypt, { hash } from "bcrypt";
import crypto from "crypto";


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

    if (isPasswordCorrect) {// if correct generate a token
        let token = crypto.randomBytes(16).toString("hex"); // creating token 

        user.token = token; // assign the token to user
        await user.save(); // save it in DB
        return res.status(httpStatus.OK).json({ token }) 
    } else {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "Invalid credentials" }); 
    }
}


const register = async (req, res) => {
    const { email, username, password } = req.body; // get the crediatials 

    const existngUser = await User.findOne({ username }); // check user exist or not
    if (existngUser) { // if exist return found..!
        return res.status(httpStatus.FOUND).json({ message: "User already exists " })
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