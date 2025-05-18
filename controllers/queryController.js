import { Query } from "../models/Query.js";
import { FormData } from "../models/FormData.js";
import { sendMail } from "../utils/mail.js";

export class QueryController {
    static createQuery = async (req, res) => {
        try {
            const { name, email, subject, message, applied_for_visa } = req.body;
            if (!(name && email && subject && message )) {
                return res.status(400).json({ error: "Please enter all fields" });
            }
            const query = await Query.create({ name, email, subject, message, applied_for_visa });
            await query.save();
            const msg = `
            <p> <strong>Name: </strong> ${name} </p>
            <p> <strong>Email: </strong> ${email} </p>
            <p> <strong>Applied For Visa: </strong> ${applied_for_visa ? "Yes" : "No"} </p>
            <p> <strong>Message: </strong> ${message} </p>
            `
            const mail = await sendMail("contact@indianevisa.info", subject, msg);
            return res.status(201).json({ msg: "Success", query });

        } catch (error) {
            console.log(error)
            res.status(500).json({ msg: "Internal server error" });
        }
    }

    static getQueries = async (req, res) => {
        try {
            const queries = await Query.find().sort({"_id":-1});
            return res.status(200).json({ msg: "Success", queries });
        } catch (error) {
            res.status(500).json({ msg: "Internal server error" });
        }
    }
}