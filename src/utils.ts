import { VoiceState } from "discord.js";

export function isVoiceChannelEmpty(voiceState: VoiceState) {
    const guild = voiceState.guild;
    const clientId = voiceState.client.user?.id;
    if (!guild || !clientId) return false;
    const voiceChannel = guild.members.me?.voice?.channel;
    if (!voiceChannel) return false;
    const members = voiceChannel.members.filter(m => !m.user.bot);
    return !members.size;
}