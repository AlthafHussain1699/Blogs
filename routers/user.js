const { Router } = require('express')
const User = require('../models/user')
const { getToken, verifyToken } = require('../tokenServices')
const {sendOtp, generateOtp} = require('../emailServices')
const crypto = require('crypto')

const route = Router();

route.get('/signIn', (req, res)=>{  
     res.render('signIn')
})

route.get('/signUp', (req, res)=>{
    res.render('signUp')
})
route.post('/addUser', async (req, res)=>{
    const {name, email, password} = req.body;
    try {
        await User.create({ name, email, password });
        res.redirect('/');
    } catch (error) {
        res.render('signUp', {invalid : true});
    }
})

route.get('/userValidation', async (req, res)=>{
    const userDetails = await User.findOne({ email : req.query.email });
    const salt = userDetails.salt
    const hashPassword = crypto.createHash('sha256', salt).update(req.query.password).digest('hex')
    if(hashPassword === userDetails.password){
        const token = getToken(userDetails);
        res.cookie("Token", token);
        res.redirect("/");
    }
    else{  
        res.render('signIn', {invalid : true})
    }
})

route.get('/logout', (req, res)=>{
    res.clearCookie('Token')
    res.redirect('/')
})



route.get('/resetPasswordPage', async (req, res)=>{
   res.render('resetPasswordPage')
})

route.post('/resetPassword', async (req, res)=>{
    const email = req.body.email
    const user = await User.findOne({email : email})
    if(!user){
        res.render('resetPasswordPage', {invalid : true})
        return ;
    }
    const otp = generateOtp();
    user.resetOtp = otp;
    user.otpExpireTime = Date.now()+(5*60*1000);
    await user.save();
    sendOtp(email, otp);
    res.render('resetPasswordPage', {otpDetails : true, email : email});
})


route.post('/updatePassword', async (req, res)=>{
      const otp = req.body.otp
      const newPassword = req.body.password
      const email = req.body.email
      const user = await User.findOne({email : email})
    if(!user){
        res.render('resetPasswordPage', {invalid : true})
        return ;
    }
    if(user.otpExpireTime > Date.now()){
        const salt = user.salt
        const hashPassword = crypto.createHash('sha256', salt).update(newPassword).digest('hex')
         if(otp == user.resetOtp){
            const filter = {
                email : email
            }
            const update = {
                $set : {
                    password : hashPassword,
                    resetOtp : undefined,
                    otpExpireTime : undefined
                }
            }
            const options = {new : true}
            await User.updateOne(filter, update, options)
         }
         else{
            res.render('resetPasswordPage', {email : email, otpDetails : true, invalidOtp : true})
            return ;
         }
    }
    else{
        res.render('resetPasswordPage', {email : email, otpDetails : true,otpTimeExpires : true})
        return ;
    }
    res.redirect('/user/signIn')
})
module.exports = route
