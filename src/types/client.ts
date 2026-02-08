import {SapphireClient} from '@sapphire/framework';
import {getRootData} from '@sapphire/pieces';
import type {ClientOptions} from 'discord.js';
import {join} from "node:path";
import {GuildService} from "../services/guildService";

export class BotClient extends SapphireClient {
    private rootData = getRootData();
    private guildService = new GuildService();

    public constructor(options: ClientOptions) {
        super(options);

        this.stores.registerPath(join(this.rootData.root, 'cdv'));
    }

    public getGuildService(): GuildService {
        return this.guildService;
    }
}