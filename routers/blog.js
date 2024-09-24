const { Router } = require("express");
const multer = require("multer");
const Blog= require('../models/blog')
const {Comment} = require('../models/comment')

const {requiredAuthantication } = require('../middlewares/authantication');


const route = Router();

const storage = multer.diskStorage({
    destination : function (req, file, cb) {
        cb(null, `public/uploadedImages/`)
    },
    filename : function (req, file, cb){
        const fileName = `${file.originalname}-${Date.now()}`
        cb(null, fileName)
    }
})
const upload = multer({
    storage : storage
})


route.get('/blogForm', (req, res)=>{
    res.render('addBlog', { user : req.user })
})

route.get('/updateBlogForm/:blogId', async (req, res)=>{
    const blogIdValue = req.params.blogId
    const blogEntity = await Blog.findById(blogIdValue).populate('createdBy').exec();
    res.render('updateBlog', {user : req.user, blog : blogEntity})
})

route.post('/updateBlog/:blogId', upload.single('coverImage'), async (req, res)=>{
    const blogId = req.params.blogId
    const {title, body} = req.body;
    const userId = req.user._id
    const update = {
        $set : {
        title : title, 
        body : body, 
        createdBy : userId,
        coverImageUrl : `/uploadedImages/${req.file.filename}`
        }
    }
    const filter = {
        _id : blogId
    }
    const options = {new : true}

    await Blog.updateOne(filter, update, options)
    res.redirect(`/blog/blogDetails/${blogId}`)
})

route.get('/deleteBlog/:blogId', async (req, res)=>{
    const blogId = req.params.blogId

    await  Blog.findByIdAndDelete(blogId)
    await  Comment.deleteMany({blogId : blogId})
    res.redirect(`/`)
})


route.post('/addBlog', upload.single('coverImage'), async (req, res)=>{
    const {title, body} = req.body;
    const userId = req.user._id
    await Blog.create({
        title, 
        body, 
        createdBy : userId,
        coverImageUrl : `/uploadedImages/${req.file.filename}`
    });
    res.redirect('/')
})

route.get('/blogDetails/:blogId', async (req, res)=>{
    const blogIdValue = req.params.blogId
    const blogEntity = await Blog.findById(blogIdValue).populate('createdBy').exec();
    const commentEntity = await Comment.find({blogId : blogIdValue}).populate('createdBy').exec();
    res.render('blogDetails', {user : req.user, blog : blogEntity, comments : commentEntity})
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

module.exports = route