import { Message, MessageMedia } from "whatsapp-web.js";
import nodemailer from 'nodemailer';
import logger from "../configs/logger.config";
import EnvConfig from "../configs/env.config";


export const forwardMessageByMail = async (message: Message) => {
    let user = await message.getContact();
    let about = await user.getAbout();
    // let profilePicUrl = await user.getProfilePicUrl();
    let frominfo = `${user.pushname} (${user.number}, ${about})`;
    let from = message.from;
    let to = "Bernhard Kaindl <kaindl@mailo.com>";
    if (user.pushname === "Denise") {
        from = "Denise Brims <brimsyoga@gmail.com>";
        to = "Alexandra Wimmer <alexandra@akzente.co.at"
    } else if (user.number === "436805503361") {
        from = "Bernhard Kaindl <bernhard@mailo.com>";
    }
    logger.info(`Forwarding email from ${frominfo} to...`);

    try {
        const info = await sendMail(from, to, `WhatsApp Message from ${user.pushname}`, message.body)
        logger.info(`Email sent: ${info.response}`);
        message.reply(`Email sent: ${info.response}`);
        return info;
    } catch (error) {
        logger.error(`Error forwarding email: ${error.message}`);
        message.reply(`Error forwarding email: ${error.message}`);
    }
}

export const sendMail = async (from: string, to: string, subject: string, html: string) => {
    const transporter = nodemailer.createTransport({
        host: EnvConfig.SENDMAIL_HOST,
        secure: true,
        auth: {
            user: EnvConfig.SENDMAIL_USER,
            pass: EnvConfig.SENDMAIL_PASS
        }
    });

    const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        html: html
    };
    try {
        const info = await transporter.sendMail(mailOptions);
        return info;
    } catch (error) {
        logger.error(`Error sending email: ${error.message}`);
        throw new Error(`Sending email failed with: ${error.message}`);
    }
}