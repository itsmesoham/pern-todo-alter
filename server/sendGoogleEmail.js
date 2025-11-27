const { google } = require("googleapis");
const oauth2Client = require("./googleClient");

function base64UrlEncode(str) {
    return Buffer.from(str)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

async function sendGoogleEmail(rawMimeEmail) {
    try {
        const gmail = google.gmail({ version: "v1", auth: oauth2Client });

        // Encode the full MIME email
        const encodedMessage = base64UrlEncode(rawMimeEmail);

        const res = await gmail.users.messages.send({
            userId: "me",
            requestBody: {
                raw: encodedMessage,
            },
        });

        return res.data;

    } catch (err) {
        console.error("GMAIL API ERROR →", err);
        throw err;
    }
}

module.exports = sendGoogleEmail;