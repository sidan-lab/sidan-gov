import { isMessageInstance } from "@sapphire/discord.js-utilities";
import { ApplicationCommandRegistry, Command } from "@sapphire/framework";

const delegationLink = process.env.DELEGATION_LINK!;

class DelegateCommand extends Command {
  constructor(context, options) {
    super(context, { ...options });
  }

  registerApplicationCommands(registry: ApplicationCommandRegistry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder
          .setName("delegate")
          .setDescription("Open a website for user to delegate to Sidan"),
      {
        idHints: ["1318736868338307153"],
      }
    );
  }

  async chatInputRun(interaction) {
    const msg = await interaction.reply({
      content: `Creating a link for you...`,
      ephemeral: true,
      fetchReply: true,
    });

    if (isMessageInstance(msg)) {
      return interaction.editReply(
        `Click to delegate to Sidan: ${delegationLink}/${interaction.user.id}`
      );
    }

    return interaction.editReply("");
  }
}
module.exports = {
  DelegateCommand,
};
