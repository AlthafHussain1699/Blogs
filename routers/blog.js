const { Router } = require("express");
const multer = require("multer");
const Blog= require('../models/blog')
const {Comment} = require('../models/comment')
const path = require('path')
const fs = require('fs');
const { error } = require("console");
const bucket = require('../firebase');
const dotenv = require('dotenv');
dotenv.config();

const route = Router();

const upload = multer({ storage: multer.memoryStorage() });

route.get('/blogForm', (req, res)=>{
    res.render('addBlog', { user : req.user })
})

route.get('/updateBlogForm/:blogId', async (req, res)=>{
    const blogIdValue = req.params.blogId
    const blogEntity = await Blog.findById(blogIdValue).populate('createdBy').exec();
    res.render('updateBlog', {user : req.user, blog : blogEntity})
})


route.post('/updateBlog/:blogId', upload.single('coverImage'), async (req, res) => {
    const blogId = req.params.blogId;

    const blog = await Blog.findById(blogId);
    if (!blog) {
        return res.status(404).send("Blog not found");
    }

    try {
       
        const fileName = blog.coverImageUrl.split('/o/')[1].split('?')[0];
        const decodedFileName = decodeURIComponent(fileName);
        const deletfile = bucket.file(decodedFileName);
        
        await deletfile.delete().catch((error) => {
            console.error('Error deleting existing image:', error);
           
        });
        const file = req.file;
        const newFileName = `BlogImages/${Date.now()}_${file.originalname}`;
        const fileUpload = bucket.file(newFileName);

        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype
            }
        });

        blobStream.on('error', (error) => {
            console.error('Error uploading file to Firebase:', error);
            return res.status(500).send('Failed to upload image');
        });

        blobStream.on('finish', async () => {
        
            const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileUpload.name)}?alt=media`;
            
            const { title, body } = req.body;
            const userId = req.user._id;

            const update = {
                $set: {
                    title: title,
                    body: body,
                    createdBy: userId,
                    coverImageUrl: publicUrl 
                }
            };

            const filter = { _id: blogId };
            const options = { new: true };
            await Blog.updateOne(filter, update, options);
            res.redirect(`/blog/blogDetails/${blogId}`);
        });
        blobStream.end(req.file.buffer);
        
    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).send('Error updating blog');
    }
});


route.get('/deleteBlog/:blogId', async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).send("Blog not found");
        }

        const fileName = blog.coverImageUrl.split('/o/')[1].split('?')[0];
        const decodedFileName = decodeURIComponent(fileName);
        const file = bucket.file(`${decodedFileName}`);

        await file.delete();
        await Blog.findByIdAndDelete(blogId);
        await Comment.deleteMany({ blogId: blogId });

        res.redirect('/');
    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).send('Failed to delete the blog: ' + error.message);
    }
});


route.post('/addBlog', upload.single('coverImage'), async (req, res) => { 
    try {
        const file = req.file;
        const fileName = `${Date.now()}_${file.originalname}`; 
        const fileUpload = bucket.file(`BlogImages/${fileName}`);
    
        const blobStream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype 
            }
        });
    
        blobStream.on('error', (error) => {
            console.error('Error uploading file to Firebase:', error);
            return res.status(500).send('Failed to upload image');
        });
    
        blobStream.on('finish', async () => {
            const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileUpload.name)}?alt=media`;
    
            const { title, body } = req.body;
            const userId = req.user._id;
    
            await Blog.create({
                title, 
                body, 
                createdBy: userId,
                coverImageUrl: publicUrl 
            });
            res.redirect("/");
        });
        blobStream.end(file.buffer);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error uploading image');
    }
    
});


route.get('/blogDetails/:blogId', async (req, res)=>{
    try{
    const blogIdValue = req.params.blogId
    const blogEntity = await Blog.findById(blogIdValue).populate('createdBy').exec();
    const commentEntity = await Comment.find({blogId : blogIdValue}).populate('createdBy').exec();
    res.render('blogDetails', {user : req.user, blog : blogEntity, comments : commentEntity})
    }
    catch(err){
        console.log(err);
    }
})

route.post('/search', async (req, res)=>{
    const search = req.body.search;
    const blogEntity = await Blog.find({
        "title" : {
            $regex : search
        }
    })
    res.render('home', {user : req.user, blogs : blogEntity})
});

route.get('/showMyBlogs', async (req, res)=>{
    const blogEntities = await Blog.find({createdBy : req.user._id})
    res.render('home', {user : req.user, blogs : blogEntities})
})

route.post('/like/:id', async (req, res) => {
    const blogId = req.params.id;
    const userId = req.user._id;
    try {
        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ message: 'Blog post not found' });
        }
        const userIndex = blog.likes.findIndex(like => like.userId.toString() === userId);
        value = 0;
        if (userIndex === -1) {
            value = 1
            blog.likes.push({ userId });
        } else {
            value = 2;
            blog.likes.splice(userIndex, 1);
        }
        await blog.save();
        res.json({ likesCount: blog.likes.length, value : value });

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Server error', error });
    }
    
});
route.get("/full-content/:id", async (req, res)=>{
    try{
        const blogIdValue = req.params.id
        const blogEntity = await Blog.findById(blogIdValue);
        res.json({ content: blogEntity.body });
    }
    catch(error){
         console.log(error);
    }
})

route.get("/less-content/:id", async (req, res)=>{
    try{
        const blogIdValue = req.params.id
        
        const blogEntity = await Blog.findById(blogIdValue);
        console.log(blogEntity.body.substring(0, 1000))
        res.json({ content: blogEntity.body.substring(0, 1000) });
    }
    catch(error){
         console.log(error);
    }
})

module.exports = route