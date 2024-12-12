const { SapphireClient } = require("@sapphire/framework");
const { GatewayIntentBits, Events } = require("discord.js");

const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;

const client = new SapphireClient({
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ],
  loadMessageCommandListeners: true,
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.isButton()) {
    const embeds = interaction.message.embeds[0].data;
    if (embeds) {
      interaction.update({
        embeds: [
          {
            ...embeds,
            footer: {
              text: `${interaction.customId == "Yay" ? "👍" : "👎"}${
                interaction.customId
              }, Voted by: ${interaction.user.username}`,
            },
          },
        ],
      });
    }
  } else {
    console.log("Error happened.");
  }
});

client.login(DISCORD_BOT_TOKEN).catch(console.error);
