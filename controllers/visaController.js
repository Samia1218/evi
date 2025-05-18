import { FormData } from "../models/FormData.js";
import dotenv from 'dotenv'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import multer from 'multer'
import { sendMail } from '../utils/mail.js'
import { uniqueId } from "../utils/uniqueId.js";
import fs from "fs"
import pdf from "pdf-creator-node"
import { checkFile } from "../helper/fileList.js";
import process from "process";
import phantomjs from "phantomjs-prebuilt"
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

const storage = multer.memoryStorage();

// Configure Multer with storage only
export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10, // Set the file size limit to 10 MB (adjust as needed)
      },
}).array('files'); // 'files' is the field name for the files, and 5 is the maximum number of files allowed

export class FormController {
    static fillForm = async (req, res) => {
        //body needs first_name, last_name, email, phone, passport_number, dateOfArrival, nationality
        try {
            if (!req.body.currentStage) return res.status(400).json({ msg: "Current Stage is required" });
            if (req.body.currentStage != 1 && req.body.id == null) return res.status(400).json({ msg: "Id is required" });
            if (req.body.currentStage == 1) {
                let id = uniqueId()
                let data = new FormData({
                    tabOne: req.body.answers,
                    currentTab: 2,
                    application_id: id,
                    status: "incomplete"
                })
                let result = await data.save()
                const params = {
                    Bucket: bucketName,
                    Key: result.application_id + '/',
                    Body: '',
                }
                const data2 = await S3.send(new PutObjectCommand(params));

                const msg = `<p>We kindly request you to complete the remaining formalities as soon as possible to ensure smooth processing of your visa application.</p>
 
                <p>As of our records, we have received your initial application for an e-visa to India. However, there are a few outstanding requirements that need your attention. These pending steps may include submitting additional documents, providing missing information, or making the necessary payments.
                
                <p>To complete your E-visa process you can use the link https://indianevisa.info/status and you Temporary Application Id is <strong>${id}</strong>.</p>`
                const mail = await sendMail(result.tabOne.email, "E-visa application", msg);
                console.log(mail)
                //todo: uncomment above block to send email to user
                return res.status(201).json({ result });
            } else if (req.body.currentStage == 2) {
                let updatedObject = await FormData.findOneAndUpdate({ application_id: req.body.id }, {
                    tabTwo: req.body.answers,
                    currentTab: 3,
                }, { new: true })
                return res.status(200).json({ updatedObject });
            } else if (req.body.currentStage == 3) {
                let updatedObject = await FormData.findOneAndUpdate({ application_id: req.body.id }, {
                    tabThree: req.body.answers,
                    currentTab: 4,
                }, { new: true })
                return res.status(200).json({ updatedObject });
            }
        } catch (error) {
            console.error(error)
            res.status(500).json({ msg: "Internal server error" });
        }
    }

    static completeStage = async (req, res) => {
        const { id, stage } = req.params
        const form = await FormData.findOne({ _id: id });
        if (!form) {
            res.status(404).json({ msg: "Application not found" });
        }
        if (form.status !== 'incomplete') {
            res.status(400).json({ msg: "Application already completed" });
        }
        try {
            switch (stage) {
                case 'applicantDetails':
                    form.applicantDetails = req.body
                    form.stage = 'passooportDetails incomplete'
                    break;
                case 'passportDetails':
                    form.passportDetails = req.body
                    form.stage = 'travelDetails incomplete'
                    break;
                case 'travelDetails':
                    form.travelDetails = req.body
                    form.stage = 'addressDetails incomplete'
                    break;
                case 'addressDetails':
                    form.addressDetails = req.body
                    form.stage = 'familyDetails incomplete'
                    break;
                case 'familyDetails':
                    form.familyDetails = req.body
                    form.stage = 'questionDetails incomplete'
                    break;
                case 'questionDetails':
                    form.questionDetails = req.body
                    form.stage = 'completed'
                    form.status = 'pending';
                    break;
                default:
                    res.status(400).json({ msg: "Invalid stage" });
                    break;
            }
            await form.save();
            res.status(200).json({ msg: `Form updated successfully` });
        } catch (error) {
            res.status(500).json({ msg: "Internal server error" });
        }

    }

    static getStatus = async (req, res) => {
        const { id } = req.params
        try {
            const application = await FormData.findOne({ application_id: id });
            if (!application) {
                return res.status(404).json({ msg: "Application not found" });
            }
            if (application.status == "incomplete") {
                return res.status(200).json({ status: "incomplete", currentTab: application.currentTab, application: application });
            } else if (application.status == "pending") {
                return res.status(200).json({ status: "pending" });
            } else if (application.status == "approved") {
                return res.status(200).json({ status: "approved", application: application });
            } else if (application.status == "rejected") {
                return res.status(200).json({ status: "rejected" });
            }
        } catch (error) {
            console.error(error)
            return res.status(500).json({ msg: "Internal server error" });
        }
    }

    /* static uploadFile = async (req, res) => {
        const {id} = req.params
        const file = req.file
        const params = {
            Bucket: bucketName,
            Key: id+'_'+file.originalname,
            Body: file.buffer,
            ContentType: file.mimetype,
        }
        try {
            const data = await S3.send(new PutObjectCommand(params))
            req.file = data
            res.status(200).json({ message: 'File uploaded successfully' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    } */
    static uploadFile = async (req, res) => {
        const { id } = req.params
        const visa = await FormData.findOne({ application_id: id });
        if (!visa) {
            res.status(404).json({ msg: "Application not found" });
        }
        const file = req.file
        const params = {
            Bucket: bucketName,
            Key: id + '_' + file.originalname,
            Body: file.buffer,
            ContentType: file.mimetype,
        }
        try {
            const data = await S3.send(new PutObjectCommand(params))
            req.file = data

            // Add S3 URL to FormData document
            visa.image_url = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${params.Key}`;
            await visa.save();

            res.status(200).json({ message: 'File uploaded successfully' })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    }

    static uploadFiles = async (req, res) => {
        const { id } = req.params;
        const visa = await FormData.findOne({ application_id: id });
        if (!visa) {
            return res.status(404).json({ msg: "Application not found" });
        }
        let uploadFile = checkFile(visa.tabOne.visa_service)
        if (uploadFile.length != req.files.length) {
            return res.status(400).json({ error: 'Please upload all files' });
        }

        try {
            var fileList = []
            for (let i = 0; i < req.files.length; i++) {
                const param = {
                    Bucket: bucketName,
                    Key: `${id}/${uploadFile[i].name.split(" ").join("_")}`,
                    Body: req.files[i].buffer,
                    ContentType: req.files[i].mimetype,
                    // ACL: 'public-read' // Sets appropriate ACL for public read access
                };
                const send = await S3.send(new PutObjectCommand(param));
                fileList.push({
                    fileName: uploadFile[i].name,
                    fileUrl: `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${param.Key}`
                })
            }
            let visa = await FormData.findOneAndUpdate({ application_id: id }, {
                uploads: {
                    status: 'complete',
                    uploadFile: fileList
                },
                currentTab: 5
            })

            return res.status(200).json({ message: 'Files uploaded successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Internal server error" });
        }
    }

    static FileList = async (req, res) => {
        const { id } = req.params;
        const visa = await FormData.findOne({ application_id: id });
        if (!visa) {
            return res.status(404).json({ msg: "Application not found" });
        }
        try {
            let filesList = checkFile(visa.tabOne.visa_service)
            res.status(200).json({ file: filesList })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ msg: "Internal server error" });
        }
    }

    static generatePdf = async (req, res) => {
        try {
            let { id } = req.params
            let application = await FormData.findOne({ application_id: id })
            if (!application) return res.status(400).json({ error: "Application not found" })
            if (!application.paid) return res.status(400).json({ error: "Application not paid" })
            const applicationHtml = fs.readFileSync('./assets/index.html', 'utf8')
            const options = {
                format: 'A3',
                orientation: 'portrait',
                border: '0mm',
                header: {
                    height: '10mm',
                },
                footer: {
                    height: '10mm',
                },
                childProcessOptions: {
                    env: {
                        OPENSSL_CONF: '/dev/null',
                    }
                },
                phantomPath: phantomjs.path
            };

            let file = []
            application.uploads.uploadFile.map(ele => {
                file.push(ele.fileUrl)
            })
            let pdfData = {
                tabOne: application.tabOne,
                tabTwo: application.tabTwo,
                tabThree: application.tabThree,
                uploads: file
            }
            await pdf.create({
                html: applicationHtml,
                data: pdfData,
                path: `./${application.application_id}.pdf`,
                type: ''
            }, options)
            let pdfRead = fs.readFileSync(`./${application.application_id}.pdf`)
            const fileName = `${application.application_id}/${application.application_id}.pdf`
            const billFile = await S3.send(new PutObjectCommand({
                Bucket: bucketName,
                Key: fileName,
                Body: pdfRead,
            }))
            fs.unlinkSync(`./${application.application_id}.pdf`)
            let result = await FormData.findOneAndUpdate({ application_id: id }, { downloadPdfUrl: `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${application.application_id}/${application.application_id}.pdf` })
            res.status(200).json({ location: `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${application.application_id}/${application.application_id}.pdf` })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: error.message })
        }
    }
}