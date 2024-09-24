const { verifyToken } = require('../tokenServices')


function cheakAuthantication(cookieName){
    return (req, res, next) =>{
        const token = req.cookies[cookieName]
        if(!token){
            next();
           return ;
        }
        try{
           const payload = verifyToken(token)
           req.user = payload;
        }catch(error){
            console.error("Invalid token:", err.message);
            res.render('signIn')
            return;
        }
        next();
    }
}

function requiredAuthantication(cookieName){
    return (req, res, next) =>{
        const token = req.cookies[cookieName]
        if(!token){
           res.redirect('/user/signIn')
           return ;
        }
        try{
           const payload = verifyToken(token)
           req.user = payload;
        }catch(error){
            console.error("Invalid token:", err.message);
            res.render('signIn')
            return;
        }
        next();
    }
}

module.exports = {
    cheakAuthantication,
    requiredAuthantication
}