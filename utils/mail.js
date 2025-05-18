import nodemailer from 'nodemailer';

export const sendMail = async (emailId, subject, body) => {
    // const transporter = nodemailer.createTransport({
    //     service: 'gmail',
    //     auth: {
    //         user: process.env.NODEMAILER_EMAIL,
    //         pass: process.env.NODEMAILER_PASSWORD,
    //     }
    // });

    const transporter = nodemailer.createTransport({
        host: "smtpout.secureserver.net",
        secure: true,
        secureConnection: false, // TLS requires secureConnection to be false
        tls: {
            ciphers: 'SSLv3'
        },
        requireTLS: true,
        port: 465,
        debug: true,
        auth: {
            user: process.env.NODEMAILER_EMAIL,
            pass: process.env.NODEMAILER_PASSWORD,
        }
    });

    const mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: emailId,
        subject: subject,
        html: body,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Mail sent: ${info.response}`);
    } catch (error) {
        console.error(error);
    }
}

