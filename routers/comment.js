const Blog = require('../models/blog')
const User = require('../models/user')
const {Comment} = require('../models/comment')
const express = require('express')
const mongoose = require('mongoose')
const dotenv = require('dotenv');
dotenv.config();
const route = express.Router();

route.get('/updateCommentForm/:commentId', async (req, res)=>{
    const commentId = req.params.commentId
    const commentEntity = await Comment.findOne({_id : commentId}).populate('createdBy').populate('blogId').exec();
    res.render('updateComment', {user : req.user,  comment : commentEntity})
})

route.post('/updateComment/:commentId', async (req, res)=>{
    const commentId = req.params.commentId
    const commentBody = req.body.comment
    const filter = {_id : commentId}
    const update = {
        $set : {
            comment : commentBody
        }
    }
    const options = { new: true }; 
    const commentEntity = await Comment.findOneAndUpdate(filter, update, options);
    res.json({success : true})
})

route.get('/addCommentForm/:blogId', async (req, res)=>{
    const blogId = req.params.blogId
    const blogEntity = await Blog.findOne({_id : blogId});
    res.render('addComment', {user : req.user, blog : blogEntity})
})

route.post('/addComment/:blogId', async (req, res)=>{
     const blogIdValue = req.params.blogId
     if(!req.body.commentBody)  res.redirect(`/blog/blogDetails/${blogIdValue}`)
     try{
    
     await Comment.create({
        comment : req.body.commentBody,
        createdBy : req.user._id,
        blogId : blogIdValue
     })
     const blog = await Blog.findById(blogIdValue);
     blog.comments += 1;
     await blog.save();
     res.redirect(`/blog/blogDetails/${blogIdValue}`)
    }
    catch(err){
        console.log(err);
        res.send(err);
    }

})


route.get('/deleteComment/:commentId', async (req, res)=>{
    const commentId = req.params.commentId
    const comment = await Comment.findOne({_id : commentId}).populate('createdBy').exec();
    if(comment.createdBy._id == req.user._id){
        await Comment.findOneAndDelete({_id : commentId})
    }
    const blog = await Blog.findById(comment.blogId);
    blog.comments -= 1;
     await blog.save();
    res.redirect(`/blog/blogDetails/${comment.blogId}`)
})

module.exports = route
