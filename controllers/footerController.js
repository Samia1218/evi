import { Footer } from "../models/Footer.js";

export class FooterController {
    static getFooter = async (req, res) => {
        const { id } = req.query
        try {
            let getFooter;
            if (id) {
                getFooter = await Footer.findById(id)
            } else {
                getFooter = await Footer.find()
            }
            res.status(200).json({
                status: true,
                message: "Footer data fetched!!",
                footer: getFooter
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: "Internal Server Error",
                status: false
            })
        }
    }
    static postFooter = async (req, res) => {
        const { heading, subLink } = req.body
        try {
            if (!heading) res.status(400).json({ message: "Heading is required", status: false })
            if (!subLink) res.status(400).json({ message: "Sub Link is required", status: false })
            let newFooter = new Footer(req.body)
            newFooter = await newFooter.save();
            res.status(201).json({
                status: true,
                message: "Footer Added!!",
                footer: newFooter
            })
        } catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                status: false
            })
        }
    }
    static updateFooter = async (req, res) => {
        const { id } = req.params;
        try {
            if (!id) return res.status(400).json({ message: "Id is required", status: false })
            let footerExist = await Footer.findById(id)
            if (!footerExist) return res.status(400).json({ message: "footer does not exist", status: false })
            let updatedFooter = await Footer.findByIdAndUpdate(id, req.body, { new: true })
            res.status(200).json({
                message: "footer updated!!",
                status: true,
                footer: updatedFooter
            })
        } catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                status: false
            })
        }
    }
    static deleteFooter = async (req, res) => {
        const { id } = req.params;
        try {
            if (!id) return res.status(400).json({ message: "Id is required", status: false })
            let footerExist = await Footer.findById(id)
            if (!footerExist) return res.status(400).json({ message: "footer does not exist", status: false })
            await Footer.findByIdAndDelete(id)
            res.status(200).json({
                message: "footer deleted!!",
                status: true
            })
        } catch (error) {
            res.status(500).json({
                message: "Internal Server Error",
                status: false
            })
        }
    }
}