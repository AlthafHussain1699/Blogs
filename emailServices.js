const nodemailer = require('nodemailer')

async function sendOtp(email, otp){
    const transpoter = nodemailer.createTransport({
        service : 'Gmail',
        auth : {
            user : 'althafhussain1699@gmail.com',
            pass : 'cjxyccqtawdorhos'
        }
    })

    const mailOptions = {
        from : 'althafhussain1699@gamil.com',
        to : email,
        subject : 'password reset otp',
        text : `your Otp for password reset is ${otp}`
    }
    await transpoter.sendMail(mailOptions)
}

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

module.exports = {
    sendOtp,
    generateOtp
}