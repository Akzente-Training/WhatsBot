import { Message, MessageMedia } from "whatsapp-web.js";
import { forwardMessageByMail } from "../utils/sendmail.util";

export const run = async (message: Message, args: string[] = null) => {
    await forwardMessageByMail(message);
};
