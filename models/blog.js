const mongoose = require('mongoose')
const User = require('./user')

const blogSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    body : {
        type : String,
        required : true
    },
    coverImageUrl : {
        type : String,
        required : true
    },
    likes :[ {
        userId : {
            type : mongoose.Schema.Types.ObjectId,
            ref : User
        }
    }],
    comments: {
        type: Number, 
        default: 0
    },
    createdBy :{
        type : mongoose.Schema.Types.ObjectId,
        ref : User
    }
})

const Blog = mongoose.model("Blog", blogSchema)

module.exports =  Blog