import Artibot from "artibot";
import artibotReseauDiscord, { ArtibotRDConfigBuilder, MonitorOption } from "./dist/index.js";
import token from "./private.js";

const artibot = new Artibot({
	ownerId: "382869186042658818",
	botName: "Artibot [DEV]",
	prefix: "abd ",
	lang: "fr",
	testGuildId: "775798875356397608",
	debug: true
});

artibot.registerModule(artibotReseauDiscord, new ArtibotRDConfigBuilder()
	.disableSlashCommand("check")
	.setMonitorOption("blacklist", MonitorOption.Kick)
	.setMonitorOption("suspect", MonitorOption.Alert)
	.setAlertRoleName("ALERT ROLE")
);

artibot.login({ token });