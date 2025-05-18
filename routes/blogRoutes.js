import express from 'express'
import { BlogController, upload } from '../controllers/blogController.js'

const router = express.Router()


router.post('/create', upload, BlogController.createBlog);
router.get('/view', BlogController.getBlogs);
router.get('/viewsingle/:id', BlogController.singleBlog)
router.get('/view/slug/:slug', BlogController.viewBySlug)
router.put('/ispublish/:id', BlogController.checkPublish)
router.put('/update/:id', upload,BlogController.updateBlog);
router.delete('/delete/:id', BlogController.deleteBlog);
router.post('/upload', upload, BlogController.uploadImage);

export default router;




