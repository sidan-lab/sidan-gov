import { EmbedBuilder } from "discord.js";
import { Command } from "@sapphire/framework";
import { BlockfrostProvider } from "@meshsdk/core";

const blockfrostApiKey = process.env.BLOCKFROST_KEY!;
const blockchainProvider = new BlockfrostProvider(blockfrostApiKey);

class ProposalsCommand extends Command {
  constructor(context, options) {
    super(context, {
      ...options,
      name: "proposals",
      aliases: ["proposals"],
      description: "proposals",
    });
  }

  async messageRun(message) {
    const getProposals = async () => {
      let result = "";

      result = await blockchainProvider.get(`/governance/proposals`);

      return result;
    };

    getProposals().then((res) => {
      res.forEach(async (proposal) => {
        const { tx_hash: txHash, cert_index: certIndex } = proposal;

        try {
          const proposalData = await blockchainProvider.get(
            `/governance/proposals/${txHash}/${certIndex}/metadata`
          );

          const { json_metadata: jsonMetadata } = proposalData;

          if (jsonMetadata) {
            const { body, authors } = jsonMetadata;

            const { title, abstract, ...fields } = body;

            const proposalEmbed = new EmbedBuilder()
              .setColor(0x0099ff)
              .setTitle(title)
              .setDescription(abstract)
              .setTimestamp();

            console.log(jsonMetadata);

            Object.keys(fields).forEach((key) => {
              let name = key.charAt(0).toUpperCase() + key.slice(1);

              let value =
                body[key] == typeof "string"
                  ? body[key]
                  : JSON.stringify(body[key]);

              if (value.length > 1024) {
                value = value.slice(0, 1020) + "...";
              }

              proposalEmbed.addFields({
                name,
                value,
              });
            });

            if (authors) {
              const authorOptions: string[] = [];

              authors.forEach((author) => {
                if (author.name) {
                  authorOptions.push(author.name);
                }
              });

              if (authorOptions.length > 0) {
                proposalEmbed.setFooter({
                  text: "Authors: " + authorOptions.join(", "),
                });
              }
            }

            await message.channel.send({ embeds: [proposalEmbed] });
          }
        } catch (error) {
          console.error(error);
        }
      });
    });

    return;
  }
}
module.exports = {
  ProposalsCommand,
};
