import { Message, MessageMedia } from "whatsapp-web.js";
import { forwardMessageByMail } from "../utils/sendmail.util";

export const run = async (message: Message, args: string[] = null) => {
    const contact = await message.getContact();
    const chat = await message.getChat();
    await forwardMessageByMail(message, chat, contact);
};
