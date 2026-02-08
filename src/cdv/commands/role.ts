import {CommandOptionsRunTypeEnum, container} from "@sapphire/framework";
import {Subcommand} from "@sapphire/plugin-subcommands";
import {MessageFlags, PermissionFlagsBits} from "discord.js";
import {BotClient} from "../../types/client";

export class RoleCommand extends Subcommand {
    public constructor(context: Subcommand.LoaderContext, options: Subcommand.Options) {
        super(context, {
            ...options,
            name: "role",
            description: "Manage division and rank roles",
            detailedDescription: "Manage division and rank roles list",
            subcommands: [
                {
                    name: "divisions",
                    type: "group",
                    entries: [
                        { name: "add", chatInputRun: "chatInputDivisionRoleAdd" },
                        { name: "remove", chatInputRun: "chatInputDivisionRoleRemove" }
                    ]
                },
                {
                    name: "ranks",
                    type: "group",
                    entries: [
                        { name: "add", chatInputRun: "chatInputRankRoleAdd" },
                        { name: "remove", chatInputRun: "chatInputRankRoleRemove" }
                    ]
                }
            ],
            runIn: CommandOptionsRunTypeEnum.GuildText,
            requiredUserPermissions: [PermissionFlagsBits.Administrator],
            preconditions: ['UptimeCheck']
        });
    }

    public override registerApplicationCommands(registry: Subcommand.Registry): void {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName(this.name)
                .setDescription(this.description)
                .addSubcommandGroup((group) =>
                    group
                        .setName("divisions")
                        .setDescription("Manage the division roles")
                        .addSubcommand((command) =>
                            command
                                .setName("add")
                                .setDescription("Add a division role")
                                .addRoleOption((option) =>
                                    option
                                        .setName("role")
                                        .setDescription("The division role to add")
                                        .setRequired(true)
                                )
                        )
                        .addSubcommand((command) =>
                            command
                                .setName("remove")
                                .setDescription("Remove a division role")
                                .addRoleOption((option) =>
                                    option
                                        .setName("role")
                                        .setDescription("The division role to remove")
                                        .setRequired(true)
                                )
                        )
                )
                .addSubcommandGroup((group) =>
                    group
                        .setName("ranks")
                        .setDescription("Manage the rank roles")
                        .addSubcommand((command) =>
                            command
                                .setName("add")
                                .setDescription("Add a rank role")
                                .addRoleOption((option) =>
                                    option
                                        .setName("role")
                                        .setDescription("The rank role to add")
                                        .setRequired(true)
                                )
                        )
                        .addSubcommand((command) =>
                            command
                                .setName("remove")
                                .setDescription("Remove a rank role")
                                .addRoleOption((option) =>
                                    option
                                        .setName("role")
                                        .setDescription("The rank role to remove")
                                        .setRequired(true)
                                )
                        )
                )
        );
    }

    /**
     * Division role add slash command logic
     * @param interaction Interaction of the command
     */
    public async chatInputDivisionRoleAdd(interaction: Subcommand.ChatInputCommandInteraction): Promise<void> {
        if (interaction.replied || interaction.deferred) {
            await interaction.deleteReply();
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const role = interaction.options.getRole("role", true);

        const client = container.client as BotClient;
        const guildService = client.getGuildService();

        const response = await guildService.addDivision(interaction.guildId!, role.id);
        await interaction.editReply({ content: response.message });
    }

    /**
     * Division role remove slash command logic
     * @param interaction Interaction of the command
     */
    public async chatInputDivisionRoleRemove(interaction: Subcommand.ChatInputCommandInteraction): Promise<void> {
        if (interaction.replied || interaction.deferred) {
            await interaction.deleteReply();
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const role = interaction.options.getRole("role", true);

        const client = container.client as BotClient;
        const guildService = client.getGuildService();

        const response = await guildService.removeDivision(interaction.guildId!, role.id);
        await interaction.editReply({ content: response.message });
    }

    /**
     * Rank role add slash command logic
     * @param interaction Interaction of the command
     */
    public async chatInputRankRoleAdd(interaction: Subcommand.ChatInputCommandInteraction): Promise<void> {
        if (interaction.replied || interaction.deferred) {
            await interaction.deleteReply();
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const role = interaction.options.getRole("role", true);

        const client = container.client as BotClient;
        const guildService = client.getGuildService();

        const response = await guildService.addRank(interaction.guildId!, role.id);
        await interaction.editReply({ content: response.message });
    }

    /**
     * Rank role remove slash command logic
     * @param interaction Interaction of the command
     */
    public async chatInputRankRoleRemove(interaction: Subcommand.ChatInputCommandInteraction): Promise<void> {
        if (interaction.replied || interaction.deferred) {
            await interaction.deleteReply();
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const role = interaction.options.getRole("role", true);

        const client = container.client as BotClient;
        const guildService = client.getGuildService();

        const response = await guildService.removeRank(interaction.guildId!, role.id);
        await interaction.editReply({ content: response.message });
    }
}

