import Artibot, { Module, SlashCommand } from "artibot";
import { SlashCommandBuilder } from "discord.js";
import Localizer from "artibot-localizer";

import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from 'module';
import checkSlashCommand from "./checkSlashCommand.js";
import ReseauDiscordAPI from "reseau-discord";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

export default function artibotReseauDiscord({ config: { lang } }: Artibot): Module {
	localizer.setLocale(lang);

	const slashCommandData: any = new SlashCommandBuilder()
		.setName("rd")
		.setDescription(localizer._("Interact with the Réseau Discord Artivain project"))
		.addSubcommand(command => command
			.setName("check")
			.setDescription(localizer._("Check for an ID in the API"))
			.addStringOption(option => option
				.setName("id")
				.setRequired(true)
				.setDescription(localizer._("ID to verify"))
				.setMinLength(17)
			)
		)
		.addSubcommand(command => command
			.setName("dbname")
			.setDescription(localizer._("Get the name of the database used"))
		);

	return new Module({
		id: "rd",
		name: "Réseau Discord",
		version,
		langs: ["fr", "en"],
		repo: "GoudronViande24/artibot-reseau-discord",
		packageName: "artibot-reseau-discord",
		parts: [
			new SlashCommand({
				id: "rd",
				data: slashCommandData,
				mainFunction: checkSlashCommand
			})
		]
	});
}

export const localizer: Localizer = new Localizer({
	filePath: path.join(__dirname, "..", "locales.json")
});

export const api: ReseauDiscordAPI = new ReseauDiscordAPI();