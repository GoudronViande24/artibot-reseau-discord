import Artibot from "artibot";
import { GuildMember, userMention, inlineCode } from "discord.js";
import { api, localizer, rdConfig, thumbnail } from "./index.js";

export default async function monitorsGlobal(artibot: Artibot) {
	artibot.client.on("guildMemberAdd", async (member: GuildMember) => {
		const { id } = member;

		if (rdConfig.monitor.blacklist === 0 && rdConfig.monitor.suspect === 0) return;

		const results = await api.check(id);

		if (results.suspect.status) {
			switch (rdConfig.monitor.suspect) {
				case 1: // Alert
					const role = member.guild.roles.cache.find(role => role.name.toLowerCase() == rdConfig.alertRoleName.toLowerCase());

					if (!role) return artibot.log("Réseau Discord", localizer.__("Role [[0]] not found in [[1]]", { placeholders: [rdConfig.alertRoleName, member.guild.name] }), "debug");

					const embed = artibot.createEmbed()
						.setTitle(localizer._("Alert"))
						.setThumbnail(thumbnail)
						.setDescription(localizer._("A user reported as suspect has joined your server."))
						.addFields([
							{
								name: localizer._("Server"),
								value: member.guild.name,
								inline: true
							},
							{
								name: localizer._("User"),
								value: `${member.user.tag} (${userMention(member.id)})\n${inlineCode(member.id)}`,
								inline: true
							}
						]);

					for (const [, member] of role.members) {
						member.send({
							embeds: [embed]
						}).catch(e => artibot.log("Réseau Discord", localizer._("An error occured when trying to send alert DM: ") + e.name + ": " + e.message, "debug"));
					}
					break;

				case 2: // Kick
					member.send({
						embeds: [
							artibot.createEmbed()
								.setTitle(localizer._("Kicked by security filter"))
								.setThumbnail(thumbnail)
								.setDescription(localizer._("You have been automaticaly kicked from the server because you have been reported.\nContact an administrator to learn more.\n\nHere is some data that might be useful:"))
								.addFields([
									{
										name: localizer._("Server"),
										value: member.guild.name,
										inline: true
									},
									{
										name: localizer._("Database"),
										value: results.dbName,
										inline: true
									},
									{
										name: localizer._("List"),
										value: localizer._("Suspects"),
										inline: true
									}
								])
						]
					}).catch(e => {
						artibot.log("Réseau Discord", localizer.__("Failed to send DM to [[0]]: ", { placeholders: [member.user.tag] }) + e.name + ": " + e.message, "debug")
					}).finally(() => {
						member.kick(localizer.__("Réseau Discord: Automatically kicked ([[0]])", { placeholders: ["suspect"] })).catch(e => {
							artibot.log("Réseau Discord", localizer.__("Failed to kick [[0]]: ", { placeholders: [member.user.tag] }) + e.name + ": " + e.message, "warn")
						});
					});
					break;

				case 3: // Ban
					member.send({
						embeds: [
							artibot.createEmbed()
								.setTitle(localizer._("Banned by security filter"))
								.setThumbnail(thumbnail)
								.setDescription(localizer._("You have been automaticaly banned from the server because you have been reported.\nContact an administrator to learn more.\n\nHere is some data that might be useful:"))
								.addFields([
									{
										name: localizer._("Server"),
										value: member.guild.name,
										inline: true
									},
									{
										name: localizer._("Database"),
										value: results.dbName,
										inline: true
									},
									{
										name: localizer._("List"),
										value: localizer._("Suspects"),
										inline: true
									}
								])
						]
					}).catch(e => {
						artibot.log("Réseau Discord", localizer.__("Failed to send DM to [[0]]: ", { placeholders: [member.user.tag] }) + e.name + ": " + e.message, "debug")
					}).finally(() => {
						member.ban({ reason: localizer.__("Réseau Discord: Automatically banned ([[0]])", { placeholders: ["suspect"] }), deleteMessageDays: 0 }).catch(e => {
							artibot.log("Réseau Discord", localizer.__("Failed to ban [[0]]: ", { placeholders: [member.user.tag] }) + e.name + ": " + e.message, "warn")
						});
					});

				default:
					break;
			}

			if (results.blacklist.status) {
				switch (rdConfig.monitor.blacklist) {
					case 1: // Alert
						const role = member.guild.roles.cache.find(role => role.name.toLowerCase() == rdConfig.alertRoleName.toLowerCase());

						if (!role) return artibot.log("Réseau Discord", localizer.__("Role [[0]] not found in [[1]]", { placeholders: [rdConfig.alertRoleName, member.guild.name] }), "debug");

						const embed = artibot.createEmbed()
							.setTitle(localizer._("Alert"))
							.setThumbnail(thumbnail)
							.setDescription(localizer._("A blacklisted user has joined your server."))
							.addFields([
								{
									name: localizer._("Server"),
									value: member.guild.name,
									inline: true
								},
								{
									name: localizer._("User"),
									value: `${member.user.tag} (${userMention(member.id)})\n${inlineCode(member.id)}`,
									inline: true
								}
							]);

						for (const [, member] of role.members) {
							member.send({
								embeds: [embed]
							}).catch(e => artibot.log("Réseau Discord", localizer._("An error occured when trying to send alert DM: ") + e.name + ": " + e.message, "debug"));
						}
						break;

					case 2: // Kick
						member.send({
							embeds: [
								artibot.createEmbed()
									.setTitle(localizer._("Kicked by security filter"))
									.setThumbnail(thumbnail)
									.setDescription(localizer._("You have been automaticaly kicked from the server because you have been reported.\nContact an administrator to learn more.\n\nHere is some data that might be useful:"))
									.addFields([
										{
											name: localizer._("Server"),
											value: member.guild.name,
											inline: true
										},
										{
											name: localizer._("Database"),
											value: results.dbName,
											inline: true
										},
										{
											name: localizer._("List"),
											value: localizer._("Blacklist"),
											inline: true
										}
									])
							]
						}).catch(e => {
							artibot.log("Réseau Discord", localizer.__("Failed to send DM to [[0]]: ", { placeholders: [member.user.tag] }) + e.name + ": " + e.message, "debug")
						}).finally(() => {
							member.kick(localizer.__("Réseau Discord: Automatically kicked ([[0]])", { placeholders: ["blacklisted"] })).catch(e => {
								artibot.log("Réseau Discord", localizer.__("Failed to kick [[0]]: ", { placeholders: [member.user.tag] }) + e.name + ": " + e.message, "warn")
							});
						});
						break;

					case 3: // Ban
						member.send({
							embeds: [
								artibot.createEmbed()
									.setTitle(localizer._("Banned by security filter"))
									.setThumbnail(thumbnail)
									.setDescription(localizer._("You have been automaticaly banned from the server because you have been reported.\nContact an administrator to learn more.\n\nHere is some data that might be useful:"))
									.addFields([
										{
											name: localizer._("Server"),
											value: member.guild.name,
											inline: true
										},
										{
											name: localizer._("Database"),
											value: results.dbName,
											inline: true
										},
										{
											name: localizer._("List"),
											value: localizer._("Blacklist"),
											inline: true
										}
									])
							]
						}).catch(e => {
							artibot.log("Réseau Discord", localizer.__("Failed to send DM to [[0]]: ", { placeholders: [member.user.tag] }) + e.name + ": " + e.message, "debug")
						}).finally(() => {
							member.ban({ reason: localizer.__("Réseau Discord: Automatically banned ([[0]])", { placeholders: ["blacklisted"] }), deleteMessageDays: 0 }).catch(e => {
								artibot.log("Réseau Discord", localizer.__("Failed to ban [[0]]: ", { placeholders: [member.user.tag] }) + e.name + ": " + e.message, "warn")
							});
						});

					default:
						break;
				}
			}
		}
	});
}