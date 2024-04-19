import { definePlugin, PluginContext } from "@utils/types";
import { Message } from "discord.js"; // Assuming you're using discord.js

export default definePlugin({
    name: "Anti Message Logger",
    description: "Prevents logging of messages from specified channels",
    authors: [
        {
            id: 12345n,
            name: "_synaptic_",
        },
    ],

    async start(context: PluginContext) {
        const { client } = context;
        const authToken = context.authToken; // Get auth token from plugin context

        // Listen for message delete events
        client.on("messageDelete", async (deletedMessage: Message) => {
            const channelId = deletedMessage.channel.id; // Extract channel ID
            const messageId = deletedMessage.id; // Extract message ID

            // Send a request to create a new message with redacted content
            const response = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: authToken,
                },
                body: JSON.stringify({
                    mobile_network_type: "unknown",
                    content: "REDACTED",
                    nonce: messageId, // Use the original message ID as nonce
                    tts: false,
                    flags: 0,
                }),
            });

            // Check if the request was successful
            if (response.ok) {
                // Parse the response to get the ID of the newly sent message
                const newMessageData = await response.json();

                // Send a DELETE request to delete the newly sent message
                const deleteResponse = await fetch(`https://discord.com/api/v9/channels/${channelId}/messages/${newMessageData.id}`, {
                    method: "DELETE",
                    headers: {
                        Authorization: authToken,
                    },
                });

                // Handle the delete response as needed
                if (!deleteResponse.ok) {
                    console.error("Failed to delete the newly sent message");
                }
            } else {
                console.error("Failed to send a new message with redacted content");
            }
        });
    },

    stop(context: PluginContext) {
        // Cleanup tasks when the plugin is stopped
    },
});
