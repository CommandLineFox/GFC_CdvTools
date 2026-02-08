import {Guild, Role} from "discord.js";
import {Document} from 'mongoose';
import Database from '../database/database';
import {CustomResponse} from "../types/customResponse";
import {Guild as DatabaseGuild} from '../types/guild';
import {addToArray, removeAllFromArray, removeFromArray} from "../utils/databaseUtils";

export class GuildService {
    /**
     * Fetch the full guild configuration object
     * Returns `null` if the guild does not exist
     * @param guildId Discord guild (server) ID
     */
    public async getGuildConfig(guildId: string): Promise<DatabaseGuild | null> {
        const database = Database.getInstance();
        if (!database) {
            return null;
        }

        const guildDocument = await database.getGuild(guildId) as Document | null;
        if (!guildDocument) {
            return null;
        }

        return { id: guildDocument.get('id'), divisions: [], ranks: [] };
    }

    /**
     * Add a role to the list of divisions
     * @param guildId Discord guild (server) ID
     * @param roleId Role ID to add
     */
    public async addDivision(guildId: string, roleId: string): Promise<CustomResponse> {
        return await addToArray(guildId,
            `divisions`,
            roleId,
            'A role with this ID already exists.',
            'Division added successfully.',
            'Error adding role.');
    }

    /**
     * Remove a role from the list of divisions
     * @param guildId Discord guild (server) ID
     * @param roleId Role ID to remove
     */
    public async removeDivision(guildId: string, roleId: string): Promise<CustomResponse> {
        return await removeFromArray(guildId,
            `divisions`,
            roleId,
            false,
            'No roles found.',
            'Division removed successfully.',
            'Error removing role.');
    }

    /**
     * Remove all roles from the list of divisions
     * @param guildId Discord guild (server) ID
     */
    public async clearDivisions(guildId: string): Promise<CustomResponse> {
        return await removeAllFromArray(guildId,
            `divisions`,
            'All divisions cleared successfully.',
            'Error removing roles.');
    }

    /**
     * Get the list of divisions
     * @param guild Discord guild (server)
     */
    public async getDivisions(guild: Guild): Promise<Role[]> {
        const database = Database.getInstance();
        if (!database) {
            return [];
        }

        const dbGuild = await database.getGuild(guild.id) as DatabaseGuild | null;
        if (!dbGuild) {
            return [];
        }

        const divisions = dbGuild.divisions;
        if (!divisions || divisions.length === 0) {
            return [];
        }

        const roles = [];
        for (const roleId of divisions) {
            const role = await guild.roles.fetch(roleId);
            if (!role) {
                await this.removeDivision(guild.id, roleId);
                continue;
            }

            roles.push(role);
        }

        return roles;
    }

    /**
     * Add a role to the list of ranks
     * @param guildId Discord guild (server) ID
     * @param roleId Role ID to add
     */
    public async addRank(guildId: string, roleId: string): Promise<CustomResponse> {
        return await addToArray(guildId,
            `ranks`,
            roleId,
            'A role with this ID already exists.',
            'Rank added successfully.',
            'Error adding role.');
    }

    /**
     * Remove a role from the list of ranks
     * @param guildId Discord guild (server) ID
     * @param roleId Role ID to remove
     */
    public async removeRank(guildId: string, roleId: string): Promise<CustomResponse> {
        return await removeFromArray(guildId,
            `ranks`,
            roleId,
            false,
            'No roles found.',
            'Rank removed successfully.',
            'Error removing role.');
    }

    /**
     * Remove all roles from the list of ranks
     * @param guildId Discord guild (server) ID
     */
    public async clearRanks(guildId: string): Promise<CustomResponse> {
        return await removeAllFromArray(guildId,
            `ranks`,
            'All ranks cleared successfully.',
            'Error removing roles.');
    }

    /**
     * Get the list of ranks
     * @param guild Discord guild (server)
     */
    public async getRanks(guild: Guild): Promise<Role[]> {
        const dbGuild = await this.getGuildConfig(guild.id);
        if (!dbGuild) {
            return [];
        }

        const ranks = dbGuild.ranks;
        if (!ranks || ranks.length === 0) {
            return [];
        }

        const roles = [];
        for (const roleId of ranks) {
            const role = await guild.roles.fetch(roleId);
            if (!role) {
                await this.removeRank(guild.id, roleId);
                continue;
            }

            roles.push(role);
        }

        return roles;
    }
}