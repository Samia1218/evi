import { FormData } from "../models/FormData.js";
import { Admin } from "../models/Admin.js";
import Papa from 'papaparse';
import dotenv from 'dotenv'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import multer from 'multer'
dotenv.config()

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const awsAccessKey = process.env.AWS_ACCESS_KEY
const awsSecretKey = process.env.AWS_SECRET_KEY

const S3 = new S3Client({
    region: bucketRegion,
    credentials: {
        accessKeyId: awsAccessKey,
        secretAccessKey: awsSecretKey
    }
});

export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        files: 1,
        fileSize: 1024 * 1024 * 10, // Set the file size limit to 10 MB (adjust as needed)
    },
}).single("file");

export class AdminController {
    static createAdmin = async (req, res) => {
        try {
            const { email, password,userType } = req.body;
            if (!(email && password && userType)) {
                return res.status(400).json({ error: "Please enter all fields" });
            }
            if(userType=="super admin")
            {
                return res.status(400).json({ error: "Super Admin Can't be created" });
            }
            const admin = await Admin.create({ email, password, userType });
            const token = await admin.generateToken();
            return res.status(201).json({ msg: "Success", token });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static loginAdmin = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({ error: "Please enter all fields" });
            }
            const user = await Admin.findOne({ email });
            if (!user) {
                return res.status(400).json({ error: "Invalid credentials" });
            }
            const isPasswordValid = await user.isValidPassword(password);
            if (!isPasswordValid) {
                return res.status(400).json({ error: "Invalid credentials" });
            }
            const token = await user.generateToken();
            return res.status(200).json({ msg: "Success", token });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static getForms = async (req, res) => {
        try {
            let forms;
            const { status } = req.query;
            const queryObject = {}
            if (status) {
                queryObject.status = status
            }else{
                queryObject["status"] = {$ne:"incomplete"}
            }
            forms = await FormData.find(queryObject).sort({"_id":-1});

            return res.status(200).json({ msg: "Success", forms });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static getFormsCsv = async (req, res) => {
        try {
            let forms;
            const { status, visaType } = req.query;
            const queryObject = {};
            if (status) {
                queryObject.status = status;
            }
            if (visaType) {
                queryObject.visaType = visaType;
            }
            forms = await FormData.find(queryObject);  //todo: remove limit
            forms = forms.map(form => {
                const { _id, ...rest } = form._doc;
                return rest;
            });
            // console.log(forms); //todo: remove

            const config = {
                quotes: true,
                delimiter: ",",
                header: true,
                newline: "\r\n",
            };

            const csvString = Papa.unparse(forms, config);
            // console.log("FORMATTING AS CSV: ", csvString);
            res.set('Content-Type', 'text/csv');
            res.set('Content-Disposition', 'attachment; filename="forms.csv"');
            res.send(csvString);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };

    static getFormById = async (req, res) => {
        try {
            const { id: formId } = req.params;
            const form = await FormData.findOne({ application_id: formId });
            if (!form) {
                return res.status(404).json({ error: "Form not found" });
            }
            return res.status(200).json({ msg: "Success", form });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static updateFormById = async (req, res) => {
        try {
            const { id: formId } = req.params;
            const { status } = req.body;
            const form = await FormData.findOneAndUpdate({ application_id: formId }, { status }, { new: true, runValidators: true });
            if (!form) {
                return res.status(404).json({ error: "Form not found" });
            }
            return res.status(200).json({ msg: "Update Success", form });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }

    static getFormAsPdf = async (req, res) => {
        try {
            const { url } = req.params;
            res.status(200).json({ msg: "Working on it" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Internal server error" });
        }
    }

    static uploadApprovedVisa = async (req, res) => {
        try {
            const { id } = req.params;
            const visa = await FormData.findOne({ application_id: id });
            const file = req.file;

            if (!file.mimetype.includes('application/pdf')) {
                return res.status(400).json({ error: 'File must be in PDF format' });
            }
            const params = {
                Bucket: bucketName,
                Key: `${id}/approvedVisa.pdf`,
                Body: file.buffer,
                ContentType: 'application/pdf',
                // ACL: 'public-read'
            }
            const data = await S3.send(new PutObjectCommand(params));
            visa.approved_visa_url = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${params.Key}`;
            visa.status="approved";
            await visa.save();
            res.status(200).json({ msg: "Uploaded approved visa successfully" });
        } catch (error) {
            console.error(error)
            res.status(500).json({ msg: "Internal server error" });
        }
    }

}