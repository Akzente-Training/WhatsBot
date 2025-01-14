import express from "express";
import logger from "./configs/logger.config";
import commands from "./commands/index";
import { ClientConfig } from "./configs/client.config";
import { Message } from "whatsapp-web.js";
import { MessageTypes } from "whatsapp-web.js";
import { readAsciiArt } from "./utils/ascii-art.util";
import { AppConfig } from "./configs/app.config";
import { isUrl } from "./utils/common.util";
import { identifySocialNetwork } from "./utils/get.util";
import EnvConfig from "./configs/env.config";
import apiRoutes from "./api/index.api";
import { onboard } from "./utils/onboarding.util";
import { forwardMessageByMail } from "./utils/sendmail.util";

const { Client } = require("whatsapp-web.js");
const path = require("path");
const client = new Client(ClientConfig);
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/public", express.static("public"));

const port = EnvConfig.PORT || 3000;
let qrData = {
    qrCodeData: "",
    qrScanned: false
};

client.on('ready', () => {
    qrData.qrScanned = true;
    // const asciiArt = readAsciiArt();
    logger.info("Ready!");
    // scheduleCrons();
});

client.on('qr', (qr: any) => {
    console.log('QR RECEIVED', qr);
    qrData.qrCodeData = qr;
    qrData.qrScanned = false;
});

const prefix = AppConfig.instance.getBotPrefix();

client.on('message_create', async (message: Message) => {
    let chat = null;

    const content = message.body.trim();

    if (message.fromMe) {
        logger.info(`Message sent from me to ${message.to}: ${content}`);
        return;
    }

    chat = await message.getChat();
    if (chat.isGroup) {
        logger.info(`Message in group ${chat.name} from ${message.author}`);
    }

    let user = await message.getContact();
    logger.info(`Message received from @${user.pushname} (${await user.getFormattedNumber()}): ${content}`);

    // If one of the labels starts with To, then forward the message by mail
    const labels = (await chat.getLabels()).map(l => l.name)
    for (let label of labels) {
        if (label.startsWith("To ")) {
            await chat.sendStateTyping();
            await forwardMessageByMail(message, chat, user);
            await chat.clearState();
            return;
        }
    }

    if (AppConfig.instance.getSupportedMessageTypes().indexOf(message.type) === -1) {
        logger.info(`Unsupported message type: ${message.type}`);
        return;  // Image
    }

    const args = content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();

    try {

        if (message.from === client.info.wid._serialized) return;
        if (message.isStatus) return;

        await onboard(message);

        if (message.type === MessageTypes.VOICE) {
            await commands[AppConfig.instance.getDefaultAudioAiCommand()].run(message, args);
            return;
        } else if (message.type === MessageTypes.TEXT) {
            const url = content.trim().split(/ +/)[0];
            const socialNetwork = identifySocialNetwork(url);

            if (url && isUrl(url) && socialNetwork) {
                await commands["get"].run(message, null, url, socialNetwork);
                return;
            } else {
                if (!content.startsWith(prefix)) return;

                if (command && command in commands) {
                    await chat.sendStateTyping();
                    await commands[command].run(message, args);
                } else {
                    chat.sendMessage(`> 🤖 Unknown command: ${command}, to see available commands, type ${prefix}help`);
                }
            }
        }
    } catch (error) {
        if (chat) chat.sendMessage(`> 🤖 Oops, something went wrong, kindly retry.`);
        logger.error(error);
    } finally {
        if (chat) await chat.clearState();
    }
});

try {
    client.initialize();
} catch (error) {
    logger.error(`Error when initializing client: ${error}`);
}

client.on('disconnected', (reason: any) => {
    logger.info(`Client was logged out with ${reason}`);
    setTimeout(() => {
        client.initialize();
    }, 5000);
});

app.use("/", apiRoutes(client, qrData));
app.listen(port, () => {
    logger.info(`Server is running on port ${port}, awaiting for client to be ready. Get started: http://localhost:${port}/`);
});
