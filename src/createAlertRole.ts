import Artibot, { log } from "artibot";
import { Message, PermissionsBitField, roleMention } from "discord.js";
import { localizer, rdConfig, thumbnail } from "./index.js";

export default async function createAlertRole(message: Message, args: string[], artibot: Artibot): Promise<void> {
	if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
		await message.reply({
			embeds: [
				artibot.createEmbed()
					.setDescription(localizer._("You must be an administrator to use this command."))
					.setColor("Red")
			]
		})
		return;
	}

	const alreadyExistingRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === rdConfig.alertRoleName.toLowerCase());
	if (alreadyExistingRole) {
		await message.reply({
			embeds: [
				artibot.createEmbed()
					.setDescription(localizer.__("The [[0]] role already exists!", { placeholders: [roleMention(alreadyExistingRole.id)] }))
					.setColor("Yellow")
			]
		});
		return;
	}

	message.guild.roles.create({
		color: "Red",
		name: rdConfig.alertRoleName,
		reason: localizer._("Réseau Discord: Created alerts role")
	}).then(role => {
		message.reply({
			embeds: [
				artibot.createEmbed()
					.setTitle("Réseau Discord")
					.setDescription(localizer.__("Role [[0]] created.", { placeholders: [roleMention(role.id)] }))
					.setColor("Green")
					.setThumbnail(thumbnail)
			]
		})
	}).catch(e => {
		message.reply({
			embeds: [
				artibot.createEmbed()
					.setDescription(localizer._("An error occured."))
					.setColor("Red")
			]
		}).catch();
		log("Réseau Discord", localizer.__("An error occured when trying to create the alert role on [[0]]: ", {
			placeholders: [message.guild.name]
		}) + e.name + ": " + e.message, "warn");
	});
}