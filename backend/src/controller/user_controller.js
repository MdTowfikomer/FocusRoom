import { UserService } from "../services/user_service.js";
import httpStatus from "http-status";

const userService = new UserService();

const login = async (req, res) => {
    try {
        const { token } = await userService.authenticate(req.body);
        return res.status(httpStatus.OK).json({ token });
    } catch (error) {
        const status = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
        return res.status(status).json({ message: error.message });
    }
}

const register = async (req, res) => {
    try {
        const result = await userService.register(req.body);
        return res.status(httpStatus.CREATED).json(result);
    } catch (error) {
        const status = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
        return res.status(status).json({ message: error.message });
    }
}

const getTurnServers = async (req, res) => {
    const servers = await userService.getIceServers();
    return res.status(httpStatus.OK).json(servers);
}

export { register, login, getTurnServers };
