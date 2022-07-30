import Artibot, { Embed } from "artibot";
import { CommandInteraction, CommandInteractionOptionResolver } from "discord.js";
import { api, localizer } from "./index.js";

export default async function checkSlashCommand(interaction: CommandInteraction, { createEmbed }: Artibot): Promise<void> {
	const options = interaction.options as CommandInteractionOptionResolver;
	const commandName: string = options.getSubcommand();
	await interaction.deferReply({ ephemeral: true });

	switch (commandName) {
		case "check":
			const id: string = options.getString("id");

			const response = await api.check(id);

			const embed: Embed = createEmbed()
				.setTitle("Check | " + response.dbName)
				.setDescription("`id`: " + id)
				.setThumbnail("https://assets.artivain.com/fav/bots/ra-512.jpg")
				.addFields(
					{
						name: localizer._("Is suspect?"),
						value: (
							response.suspect.status ?
								// Is suspect
								`**${localizer._("Yes")}**\n${localizer.__("Added by [[0]]", {
									placeholders: [response.suspect.addedBy]
								})}\n${localizer.__("On [[0]] ([[1]])", {
									placeholders: [
										`<t:${Math.round(parseInt(response.suspect.since) / 1000)}:f>`,
										`<t:${Math.round(parseInt(response.suspect.since) / 1000)}:R>`
									]
								})}` :
								// Not suspect
								localizer._("No")
						),
						inline: true
					},
					{
						name: localizer._("Is blacklisted?"),
						value: (
							response.blacklist.status ?
								// Is blacklisted
								`**${localizer._("Yes")}**\n${localizer.__("Added by [[0]]", {
									placeholders: [response.blacklist.addedBy]
								})}\n${localizer.__("On [[0]] ([[1]])", {
									placeholders: [
										`<t:${Math.round(parseInt(response.blacklist.since) / 1000)}:f>`,
										`<t:${Math.round(parseInt(response.blacklist.since) / 1000)}:R>`
									]
								})}` :
								// Not blacklisted
								localizer._("No")
						),
						inline: true
					}
				);

			await interaction.editReply({
				embeds: [embed]
			});
			break;

		case "dbname":
			await interaction.editReply({
				embeds: [
					createEmbed()
						.setTitle(await api.dbName() as string)
				]
			});
			break;

		default:
			throw new Error("Unknown command");
	}
}