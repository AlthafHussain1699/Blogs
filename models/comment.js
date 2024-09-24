const mongoose = require('mongoose')
const User = require('./user');
const  Blog  = require('./blog');

const commentSchema = new mongoose.Schema({
    comment : {
        type : String,
        required : true
    },
    createdBy :{
        type : mongoose.Schema.Types.ObjectId,
         ref: User
    },
    blogId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : Blog
    }
}, {timestamps : true})

const Comment = mongoose.model("Comment", commentSchema);

module.exports = {Comment}