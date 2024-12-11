const { SapphireClient } = require("@sapphire/framework");
const { GatewayIntentBits, Events } = require("discord.js");

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

const client = new SapphireClient({
  presence: {
    activity: {
      name: "for commands!",
      type: "LISTENING",
    },
  },
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
  loadMessageCommandListeners: true,
});

client.login(DISCORD_BOT_TOKEN).catch(console.error);
