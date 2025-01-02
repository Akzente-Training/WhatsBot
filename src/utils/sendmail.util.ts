import { Contact, Chat, Message, MessageMedia } from "whatsapp-web.js";
import axios from 'axios';
import nodemailer from 'nodemailer';
import logger from "../configs/logger.config";
import EnvConfig from "../configs/env.config";
import Mail from "nodemailer/lib/mailer";


export const forwardMessageByMail = async (message: Message, chat: Chat, contact: Contact) => {
    let frominfo = "~" + contact.pushname;
    if (frominfo === "~undefined") {
        frominfo = "myself";
    }
    if (contact.isMyContact) {
        frominfo = contact.name;
    }
    let from = frominfo
    let about = await contact.getAbout();
    if (about) {
        frominfo = `${frominfo}<br>Info: ${about}`;
    }
    // append the contact number to the frominfo
    frominfo = `${frominfo}<br>Tel: ${await contact.getFormattedNumber()}`;

    // Try to get the email address from the contact
    let to = "Bernhard Kaindl <kaindl@mailo.com>";
    if (contact.pushname === "Denise") {
        from = "Denise Brims <brimsyoga@gmail.com>";
        to = "Alexandra Wimmer <alexandra@akzente.co.at"
    } else if (contact.number === "436805503361") {
        from = "Bernhard Kaindl <bernhard@mailo.com>";
    }
    let sender = frominfo;
    logger.info(`Message received from ~${contact.pushname} (${contact.number})`);

    if (contact.isMyContact) {
        sender = contact.name;
    }
    if (chat.isGroup) {
        logger.info(`Message received in group ${chat.name}!`);
        sender = `${sender} in ${chat.name}`;
    }
    sender = `${sender} (${await contact.getFormattedNumber()})`;
    logger.info(`Chat name / sender: ${sender}`);

    logger.info(`Forwarding email from ${frominfo} to...`);

    // insert "<p>" after each ".", "!", "?" "," and Emojis in the message.body:
    let body = message.body;
    body = body.replace(/([.!?,])/g, "$1<p>");
    body = body.replace(/([\p{Emoji}] )/gu, "$1<p>");

    const mail = {
        from: from,
        to: to,
        subject: `WhatsApp Message from ${sender}`,
        html: `${body}<p>--<br>${frominfo}`,
        attachments: []
    };
    if (message.hasMedia) {
        let media = await message.downloadMedia();
        mail.attachments = [
            {
                filename: media.filename,
                content: media.data,
                contentType: media.mimetype,
                encoding: 'base64',
                cid: "1"
            }
        ];
        mail.html = `${mail.html}<p><img src="cid:1"/>`;
    }
    let profilePicUrl = await contact.getProfilePicUrl();
    if (profilePicUrl) {
        let data = await axios.get(profilePicUrl, { responseType: 'arraybuffer' });
        let profilePic = Buffer.from(data.data).toString('base64');
        // Add the profile picture as an attachment
        mail.attachments.push({
            filename: 'profilePic.jpg',
            content: profilePic,
            encoding: 'base64',
            cid: "profilePic"
        });
        // Add the profile picture in front of the message
        mail.html = `<img src="cid:profilePic" width="100" height="100"/><br>${mail.html}`;
    }

    try {
        const info = await sendMail(mail)
        logger.info(`Email sent: ${info.response}`);
        if (chat.name === "Power of 8 2024") {
            return info;
        }
        if (chat.name !== "Bernhard Kaindl") {
            return info;
        }
        if (info.response === "250 Message to be delivered") {
            message.react("📧");
        } else {
            message.reply(`Email sent: ${info.response}`);
        }
        return info;
    } catch (error) {
        logger.error(`Error forwarding email: ${error.message}`);
        message.reply(`Error forwarding email: ${error.message}`);
    }
}

// create the transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        host: EnvConfig.SENDMAIL_HOST,
        secure: true,
        auth: {
            user: EnvConfig.SENDMAIL_USER,
            pass: EnvConfig.SENDMAIL_PASS
        }
    });
}

// send the email
export const sendMail = async (mail: Mail.Options) => {
    try {
        const info = await createTransporter().sendMail(mail);
        return info;
    } catch (error) {
        logger.error(`Error sending email: ${error.message}`);
        throw new Error(`Sending email failed with: ${error.message}`);
    }
}