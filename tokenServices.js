const jwt = require('jsonwebtoken');
const secret = "Althaf@1699";

function getToken(user){
    
    return jwt.sign({
    _id : user._id, 
    name : user.name, 
    email : user.email,
    profileImageUrl : user.profileImageUrl,
    role : user.role, history : user.history}, secret);
}

function verifyToken(token){
    return jwt.verify(token, secret);
}

module.exports = {
    getToken,
    verifyToken
}