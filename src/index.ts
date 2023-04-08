import Artibot, { Command, Global, Module, SlashCommand } from "artibot";
import { SlashCommandBuilder } from "discord.js";
import Localizer from "artibot-localizer";

import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from 'module';
import slashCommands from "./slashCommands.js";
import ReseauDiscordAPI from "reseau-discord";
import monitorsGlobal from "./global.js";
import createAlertRole from "./createAlertRole.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = createRequire(import.meta.url);
const { version } = require('../package.json');

interface ArtibotRDConfig {
	slashCommands: {
		check: boolean;
		dbname: boolean;
	}

	alertRoleName: string;
	baseUrl: string;

	monitor: {
		suspect: MonitorOption;
		blacklist: MonitorOption;
	}
}

/** Possible options for a monitor */
export enum MonitorOption {
	/** Do nothing */
	None = 0,
	/** Send an alert in DM to the defined role */
	Alert = 1,
	/** Kick directly */
	Kick = 2,
	/** Ban directly */
	Ban = 3
}

export class ArtibotRDConfigBuilder implements ArtibotRDConfig {
	slashCommands: { check: boolean; dbname: boolean; } = {
		check: true,
		dbname: true
	};

	alertRoleName: string = "RD ALERTS";
	baseUrl: string = "https://api-rd.artivain.com";

	monitor: { suspect: MonitorOption, blacklist: MonitorOption } = {
		suspect: MonitorOption.None,
		blacklist: MonitorOption.None
	};

	/** Set option for a monitor */
	public setMonitorOption(monitor: "suspect" | "blacklist", option: MonitorOption): ArtibotRDConfigBuilder {
		this.monitor[monitor] = option;
		return this;
	}

	/** Set the alert role name */
	public setAlertRoleName(name: string): ArtibotRDConfigBuilder {
		this.alertRoleName = name;
		return this;
	}

	/** Set the base URL for the API */
	public setBaseUrl(url: string): ArtibotRDConfigBuilder {
		if (url.endsWith("/")) url = url.slice(0, -1);
		this.baseUrl = url;
		return this;
	}

	/** Enable a slash command */
	public enableSlashCommand(command: "check" | "dbname"): ArtibotRDConfigBuilder {
		this.slashCommands[command] = true;
		return this;
	}

	/** Disable a slash command */
	public disableSlashCommand(command: "check" | "dbname"): ArtibotRDConfigBuilder {
		this.slashCommands[command] = false;
		return this;
	}
}

export default function artibotReseauDiscord({ config: { lang } }: Artibot, config: ArtibotRDConfig): Module {
	rdConfig = config;
	localizer.setLocale(lang);

	api.setBaseUrl(config.baseUrl);

	const slashCommandData: SlashCommandBuilder = new SlashCommandBuilder()
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
		) as SlashCommandBuilder;

	return new Module({
		id: "rd",
		name: "Réseau Discord",
		version,
		langs: ["fr", "en"],
		repo: "GoudronViande24/artibot-reseau-discord",
		packageName: "artibot-reseau-discord",
		parts: [
			new SlashCommand({
				id: "rd-command",
				data: slashCommandData,
				mainFunction: slashCommands
			}),

			new Global({
				id: "rd-monitors",
				mainFunction: monitorsGlobal,
			}),

			new Command({
				id: "createalertrole",
				name: "createalertrole",
				mainFunction: createAlertRole,
				cooldown: 5,
				description: localizer._("Create the alert role to allow people to receive alerts."),
				guildOnly: true,
				requiresArgs: false
			})
		]
	});
}

export const localizer: Localizer = new Localizer({
	filePath: path.join(__dirname, "..", "locales.json")
});

export const api: ReseauDiscordAPI = new ReseauDiscordAPI();

export let rdConfig: ArtibotRDConfig;

export const thumbnail = "https://assets.artivain.com/fav/bots/ra-512.jpg";