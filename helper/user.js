const nodemailer = require("nodemailer");
const jwt = require('jsonwebtoken');

const smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
    }
});

exports.SendPasswordResetMail = function (host, email, uid, cb) {
    var token = jwt.sign({_id: uid}, process.env.SECRET_KEY);
    link = "http://" + host + "/user/resetpassword?token=" + token;
    mailOptions = {
        to: email,
        subject: "[CaroVN] Reset password",
        html: "Hello,<br> Please Click on the link to reset account password.<br><a href=" + link + ">Click here to verify</a>"
    }
    console.log(mailOptions);
    console.log(smtpTransport.auth);
    smtpTransport.sendMail(mailOptions, function (error, response) {
        if (error) {
            console.log(error);
            cb(error);
        } else {
            console.log("Message sent: " + response.toString());
            cb(null, token);
        }
    });
}