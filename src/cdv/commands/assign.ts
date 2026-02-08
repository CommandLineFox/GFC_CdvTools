import {Command, CommandOptionsRunTypeEnum, container} from "@sapphire/framework";
import {ActionRowBuilder, MessageFlags, PermissionFlagsBits, StringSelectMenuBuilder, StringSelectMenuOptionBuilder} from "discord.js";
import {Config} from "../../config/config";
import {BotClient} from "../../types/client";

export class AssignCommand extends Command {
    public constructor(context: Command.LoaderContext, options: Command.Options) {
        super(context, {
            ...options,
            name: "assign",
            description: "Assign division roles to a specific user",
            detailedDescription: "Get a menu for assigning division roles to a user",
            runIn: CommandOptionsRunTypeEnum.GuildText,
            requiredUserPermissions: [PermissionFlagsBits.Administrator],
            preconditions: ['UptimeCheck']
        });
    }

    public override registerApplicationCommands(registry: Command.Registry): void {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addUserOption((option) =>
                    option
                        .setName("user")
                        .setDescription("The user to assign roles to")
                        .setRequired(true)
                )
        );
    }

    public async chatInputRun(interaction: Command.ChatInputCommandInteraction): Promise<void> {
        if (interaction.replied || interaction.deferred) {
            await interaction.deleteReply();
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        if (!interaction.inGuild()) {
            await interaction.editReply("This command can only be used in a guild");
            return;
        }

        const clientConfig = Config.getInstance().getClientConfig();
        if (!clientConfig.cdv) {
            await interaction.editReply({ content: "This command can only be used by career development" });
            return;
        }

        const client = container.client as BotClient;
        const guildService = client.getGuildService();

        const divisionRoles = await guildService.getDivisions(interaction.guild!);
        if (!divisionRoles || divisionRoles.length === 0) {
            await interaction.editReply({ content: "There are no division roles set up" });
            return;
        }

        const targetUser = interaction.options.getUser("user", true);
        const targetMember = await interaction.guild!.members.fetch(targetUser);
        if (!targetMember) {
            await interaction.editReply({ content: "Couldn't find the member" });
            return;
        }

        const options = divisionRoles.map((role) => {
            const hasRole = targetMember.roles.cache.has(role.id);

            return new StringSelectMenuOptionBuilder()
                .setLabel(role.name)
                .setValue(role.id)
                .setDescription(`Assign ${role.name} division`)
                .setDefault(hasRole);
        });

        const selectionMenu = new StringSelectMenuBuilder()
            .setCustomId(`assign-division-${targetUser.id}`)
            .setPlaceholder("Select up to 4 division roles to assign")
            .setMinValues(1)
            .setMaxValues(Math.min(4, options.length))
            .addOptions(options);

        const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectionMenu);

        await interaction.editReply({
            content: `Select divisions to assign to **${targetUser.username}**:`,
            components: [row]
        });
    }
}