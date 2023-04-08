import Artibot, { Embed } from "artibot";
import { ChatInputCommandInteraction } from "discord.js";
import { api, localizer, rdConfig, thumbnail } from "./index.js";

export default async function slashCommands(interaction: ChatInputCommandInteraction<"cached">, { createEmbed }: Artibot): Promise<void> {
	const commandName: string = interaction.options.getSubcommand();

	if (!rdConfig.slashCommands[commandName]) {
		await interaction.reply({
			embeds: [
				createEmbed()
					.setDescription(localizer._("This command is disabled."))
					.setColor("Yellow")
			],
			ephemeral: true
		});
		return;
	}

	await interaction.deferReply({ ephemeral: true });

	switch (commandName) {
		case "check":
			const id: string = interaction.options.getString("id", true);

			const response = await api.check(id);

			const embed: Embed = createEmbed()
				.setTitle("Check | " + response.dbName)
				.setDescription("`id`: " + id)
				.setThumbnail(thumbnail)
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
						.setTitle(await api.dbName())
				]
			});
			break;

		default:
			throw new Error("Unknown command");
	}
}