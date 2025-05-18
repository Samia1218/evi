import { Blog } from "../models/Blog.js";
import slugify from 'slugify';
import { generateRandomKey } from "../helper/randomkey.js";
import dotenv from 'dotenv'
import multer from 'multer'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
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

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10, // Set the file size limit to 10 MB (adjust as needed)
    },
}).array('file');
export class BlogController {
    static createBlog = async (req, res) => {
        try {
            const { title, description, category, publishedDate, lastUpdate, metaTitle, metaDescription } = req.body;
            const file = req.files[0]
            if (!title) return res.status(400).json({ msg: "title is required" })
            if (!description) return res.status(400).json({ msg: "description is required" })
            if (!category) return res.status(400).json({ msg: "Category is required" })
            if (!file) return res.status(400).json({ msg: "Thumbnail is required" })

            const params = {
                Bucket: bucketName,
                Key: 'blog/' + new Date().valueOf(),
                Body: file.buffer,
                ContentType: file.mimetype,
            }
            const send = await S3.send(new PutObjectCommand(params));

            const baseSlug = slugify(title, { lower: true });

            // Generate a unique 6-digit key
            const randomKey = generateRandomKey();

            // Combine the base slug and the random key to create a unique slug
            const slug = `${baseSlug}`;

            const newBlog = new Blog({
                title,
                slug,
                description,
                thumbnail: `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${params.Key}`,
                category,
                publishedDate,
                lastUpdate,
                metaTitle,
                metaDescription
            })
            const savedBlog = await newBlog.save();
            res.status(200).json({
                msg: "Blog added successfully!",
                savedBlog
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({ msg: "Internal server error" });
        }
    }

    static getBlogs = async (req, res) => {
        const { isPublished } = req.query
        try {
            let searchQuery = {}
            if (isPublished) {
                searchQuery["isPublished"] = true
            }
            const allBlogs = await Blog.find(searchQuery);
            if (!allBlogs) {
                return res.status(400).json({ msg: "No Blog present here!" })
            } else {
                res.status(200).json(allBlogs)
            }

        } catch (error) {
            res.status(500).json({ msg: "Internal server error" });
        }
    }

    static viewBySlug = async (req, res) => {
        const { slug } = req.params
        try {
            if (!slug) res.status(400).json({ msg: "slug is required" });
            const singleBlog = await Blog.findOne({ slug });
            if (!singleBlog) {
                return res.status(400).json({ msg: "No Blog found" })
            } else {
                res.status(200).json(singleBlog)
            }
        } catch (error) {
            res.status(500).json({ msg: "Internal server error" });
        }
    }

    static singleBlog = async (req, res) => {
        try {
            const { id } = req.params;

            const singleBlog = await Blog.findById(id);
            if (!singleBlog) {
                return res.status(400).json({ msg: "No Blog found" })
            } else {
                res.status(200).json(singleBlog)
            }
        } catch (error) {
            res.status(500).json({ msg: "Internal server error" });
        }
    }

    static checkPublish = async (req, res) => {
        try {
            const { id } = req.params;
            const blog = await Blog.findById(id);

            if (!blog) {
                return res.status(404).json({ msg: "Blog not found" });
            }
            // Check if the blog is published
            const checkpublished = blog.isPublished ? false : true;

            const updateResponse = await Blog.findByIdAndUpdate(req.params.id, { isPublished: checkpublished }, { new: true })
            // Return json data
            return res.status(200).json({
                message: "Publish Status updated",
                blog: updateResponse
            });
        } catch (error) {
            console.log(error)
            res.json({ msg: "Internal Server Error!" })
        }
    }

    static updateBlog = async (req, res) => {
        try {
            const { id } = req.params;
            const file = req.files[0]
            // Find the blog post by its ID
            const existingBlog = await Blog.findById(id);

            if (!existingBlog) {
                return res.status(404).json({ msg: "Blog not found" });
            }

            if (file) {
                const params = {
                    Bucket: bucketName,
                    Key: 'blog/' + new Date().valueOf(),
                    Body: file.buffer,
                    ContentType: file.mimetype,
                }
                const send = await S3.send(new PutObjectCommand(params));
                req.body.thumbnail = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${params.Key}`
            }

            // Make a copy of the existing blog data
            const updatedBlogData = { ...existingBlog.toObject() };

            // Update the blog post fields with the request body
            Object.assign(updatedBlogData, req.body);

            // Check if the title has changed
            if (req.body.title && req.body.title !== existingBlog.title) {

                // Update the slug based on the new title
                const baseSlug = slugify(req.body.title, { lower: true });
                // Generate a unique 6-digit key
                const randomKey = generateRandomKey();
                // Append the key to the base slug
                updatedBlogData.slug = `${baseSlug}-${randomKey}`;
            }

            // Save the updated blog post
            const updatedBlog = await Blog.findByIdAndUpdate(id, updatedBlogData, { new: true });
            res.status(200).json({ msg: "Blog updated successfully", updatedBlog });
        } catch (error) {
            console.error(error);
            res.status(500).json({ msg: "Internal Server Error!" });
        }
    };

    static deleteBlog = async (req, res) => {
        try {
            const deleteBlog = await Blog.findByIdAndDelete(req.params.id)
            if (!deleteBlog) {
                return res.status(400).json({ msg: "This id does not exist!" })
            } else {
                return res.status(200).json({ msg: "Blog has deleted!" })
            }

        } catch (error) {
            res.status(500).json({ msg: "Internal server error" });
        }
    }
    static uploadImage = async (req, res) => {
        const file = req.files[0]
        const params = {
            Bucket: bucketName,
            Key: 'blog/' + new Date().valueOf(),
            Body: file.buffer,
            ContentType: file.mimetype,
        }
        try {
            const data = await S3.send(new PutObjectCommand(params))
            req.file = data

            // Add S3 URL to FormData document
            let image_url = `https://${bucketName}.s3.${bucketRegion}.amazonaws.com/${params.Key}`;
            console.log(image_url)

            res.status(200).json({ message: 'File uploaded successfully', url: image_url })
        } catch (error) {
            res.status(500).json({ error: error.message })
        }
    };
}