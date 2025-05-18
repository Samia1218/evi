import jwt from 'jsonwebtoken';
import { Admin } from '../models/Admin.js';

export const auth = async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization||!authorization.startsWith("Bearer ")) {
        return res.status(401).json({ error: "You must be logged in" });
    } else {
        const token = authorization.replace("Bearer ", "");
        const data = jwt.verify(token, process.env.JWT_SECRET);
        if (!data) {
            return res.status(401).json({ error: "You must be logged in" });
        } else {
            const { _id } = data;
            let userType  = await Admin.findById(data._id)
            userType = userType.userType
            req.user = data;
            req.userType = userType
            next();
        }
    }
};