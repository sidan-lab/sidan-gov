import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "@sapphire/framework";
import { BlockfrostProvider } from "@meshsdk/core";
import { GovernanceProposal } from "../../types/cardano";
import { isMessageInstance } from "@sapphire/discord.js-utilities";

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

    getProposals().then((res: any) => {
      res.forEach(async (proposal: GovernanceProposal) => {
        const {
          tx_hash: txHash,
          cert_index: certIndex,
          governance_type: governanceType,
        } = proposal;

        try {
          const proposalData = await blockchainProvider.get(
            `/governance/proposals/${txHash}/${certIndex}/metadata`
          );

          const { json_metadata: jsonMetadata } = proposalData;

          if (jsonMetadata) {
            const { body, authors } = jsonMetadata;

            const { title, abstract, references, externalUpdates, ...fields } =
              body;

            const proposalEmbed = new EmbedBuilder()
              .setURL(
                `https://cardano.ideascale.com/a/dtd/${txHash}/${certIndex}`
              )
              .setColor(0x0099ff)
              .setTitle(title)
              .setDescription("```\n" + abstract + "\n```")
              .setTimestamp();

            Object.keys(fields).forEach((key) => {
              let name = key.charAt(0).toUpperCase() + key.slice(1);

              let value =
                body[key] == typeof "string"
                  ? body[key]
                  : JSON.stringify(body[key]);

              value = value.replace(/['"]+/g, "");

              if (value.length > 1000) {
                value = value.slice(0, 999) + "...";
              }

              value = "`" + value + "`";

              proposalEmbed.addFields({
                name,
                value,
              });
            });

            if (references && references.length > 0) {
              let referenceValue = ``;
              references.forEach((reference) => {
                const { uri, label } = reference;

                const referenceString = `${label}: ${uri}`;

                if (referenceValue.length + referenceString.length > 1024) {
                  return;
                }

                referenceValue += referenceString + "\n";
              });

              proposalEmbed.addFields({
                name: "References",
                value: referenceValue,
              });
            }

            if (externalUpdates && externalUpdates.length > 0) {
              let externalUpdatesValue = ``;
              externalUpdates.forEach((externalUpdate) => {
                const { uri, title } = externalUpdate;

                const externalUpdateString = `${title}: ${uri}`;

                if (
                  externalUpdatesValue.length + externalUpdateString.length >
                  1024
                ) {
                  return;
                }

                externalUpdatesValue += externalUpdateString + "\n";
              });
            }

            if (authors) {
              const authorOptions: string[] = [];

              authors.forEach((author) => {
                if (author.name) {
                  authorOptions.push(author.name);
                }
              });

              if (authorOptions.length > 0) {
                proposalEmbed.setFields({
                  name: "Authors",
                  value: "Authors: " + authorOptions.join(", "),
                });
              }
            }

            // proposalEmbed.setFooter({
            //   text: `👍Yay: 0, 👎Nay: 0`,
            // });

            const yay = new ButtonBuilder()
              .setCustomId(`Yay`)
              .setLabel("Yay")
              .setStyle(ButtonStyle.Success);

            const nay = new ButtonBuilder()
              .setCustomId(`Nay`)
              .setLabel("Nay")
              .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder().addComponents(yay, nay);

            await message.channel.send({
              embeds: [proposalEmbed],
              components: [row],
            });
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
