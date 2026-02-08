import {InteractionHandler, InteractionHandlerTypes} from "@sapphire/framework";
import {MessageFlags, Role, StringSelectMenuInteraction} from "discord.js";

export class DivisionSelectMenuHandler extends InteractionHandler {
    public constructor(ctx: InteractionHandler.LoaderContext, options: InteractionHandler.Options) {
        super(ctx, {
            ...options,
            interactionHandlerType: InteractionHandlerTypes.SelectMenu
        });
    }

    public override async parse(interaction: StringSelectMenuInteraction) {
        if (!interaction.customId.startsWith("assign-division")) {
            return this.none();
        }

        return this.some();
    }

    /**
     * Handle what happens when the menu is pressed.
     * @param interaction The menu interaction
     */
    public async run(interaction: StringSelectMenuInteraction): Promise<void> {
        if (interaction.replied || interaction.deferred) {
            await interaction.deleteReply();
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        if (!interaction.inGuild()) {
            await interaction.editReply("This menu can only be used in a server.");
            return;
        }

        const userId = interaction.customId.split('-')[2];
        if (!userId) {
            await interaction.editReply("Couldn't find the user ID.");
            return;
        }

        const member = await interaction.guild!.members.fetch(userId);
        if (!member) {
            await interaction.editReply("Couldn't find the member.");
            return;
        }

        const guildService = (this.container.client as any).getGuildService();

        const allDivisionRoles = await guildService.getDivisions(interaction.guild!);
        const allDivisionIds = allDivisionRoles.map((r: Role) => r.id);

        const selectedIds = interaction.values;

        const currentRoles = member.roles.cache;

        const rolesToAdd = selectedIds.filter(id => !currentRoles.has(id));

        const rolesToRemove = allDivisionIds.filter((id: string) => currentRoles.has(id) && !selectedIds.includes(id));

        try {
            if (rolesToAdd.length > 0) {
                await member.roles.add(rolesToAdd);
            }
            if (rolesToRemove.length > 0) {
                await member.roles.remove(rolesToRemove);
            }

            await interaction.editReply(`Updated: Added ${rolesToAdd.length}, Removed ${rolesToRemove.length} roles.`);
        } catch (error) {
            this.container.logger.error(error);
            await interaction.editReply("Error: Check hierarchy (Bot role must be above targeted roles).");
        }
    }
}