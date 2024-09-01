<body>
    <div align="center">
        <h1>
            WhatsBot 
            <a href="https://yaasiin-dev.vercel.app/" target="_blank">
                <img src="https://vercelbadge.vercel.app/api/yaasiin-ayeva/yaasiin.dev" alt="Vercel deployment status" style="vertical-align: middle;">
            </a>
        </h1>
        <img src="public/botavatar.gif" alt="Preview" width="40%" style="max-width: 300px; border-radius: 8px;">
        <p>
            Simple WhatsApp bot from unofficial WhatsApp API, built in NodeJS &amp; TypeScript, using Gemini &amp; ChatGPT APIs for completion, with many cool features. You can interact with the bot using voice messages, and it will transcribe and respond. 🤖
        </p>
        <!-- <p>
            Try it here: <a href="https://wa.me/qr/SBHRATABRAZVA1" target="_blank">WhatsBot Playground</a> or scan the QR code below:
        </p>
        <br>
        <img src="public/qr.jpg" width="35%" alt="WhatsApp QR Code" style="margin-top: 20px;"> -->
    </div>
</body>


### Features

In development mode, your bot prefix will be automatically set to `!`. Meanning that you can use `!help` to get the list of commands instead of `/help`.

| Feature | Description | Example |
| --- | --- | --- |
| Voice Chat | Get voice chat transcript | Just send an audio message |
| AI Completion with Gemini AI | Sends a message to the AI | `/chat [text]` |
| AI Completion with ChatGPT | Sends a message to the AI | `/gpt [text]` |
| Video Download from social media | Download file from social media | `/get <url>` or just send the link |
| Memes | Get random meme | `/meme` |
| Jokes | Get random joke | `/joke` |
| Help | Get help | `/help` |
| Ping | Ping the bot | `/ping` |
| Language Translation | Translate text to the specified language | `/translate [language-code] [text]` |
| Weather | Get current weather for a city | `/meteo <city>` |


### Getting Started

- Runninng Locally without docker

```bash
npm install
cp .env.example .env
npm run dev
```

Make sure the environment variables are set before starting the server

A QR code will be generated in the terminal for you to scan.
Kindly scan it with your whatsapp app and you're all set! 🎉

### Configurations

You can change the configurations in `src/configs/app.config.ts`

For third-party services used in the bot, kindly get the API keys and set them correctly. These are the one used in the bot, skipping them could lead to limitations :

- [Gemini](https://aistudio.google.com/app/apikey) : AI for text completion
- [ChatGPT](https://platform.openai.com/api-keys) : ChatGPT for text completion
- [Open Weather API](https://www.weatherapi.com/my/) : Provides weather information
- [Speechify](https://console.sws.speechify.com/api-keys) : Text-to-Speech tool used in this project
- [AssemblyAI](https://www.assemblyai.com/docs) : Speech to text tool used in this project 

### Disclaimer
> [!IMPORTANT]
> **It is not guaranteed you will not be blocked by using this method. WhatsApp does not allow bots or unofficial clients on their platform, so this shouldn't be considered totally safe.**

### Contributing

If you'd like to contribute, please read the [Contributing Guide](CONTRIBUTING.md)

## License

[MIT](LICENSE)
