import Artibot from "artibot";
import artibotReseauDiscord from "./dist/index.js";
import token from "./private.js";

const artibot = new Artibot({
	ownerId: "382869186042658818",
	botName: "Artibot [DEV]",
	prefix: "abd ",
	lang: "fr",
	testGuildId: "775798875356397608",
	debug: true
});

artibot.registerModule(artibotReseauDiscord);

artibot.login({ token });