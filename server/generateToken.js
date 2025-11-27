const { google } = require("googleapis");
require("dotenv").config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GC_CLIENT_ID,
    process.env.GC_CLIENT_SECRET,
    "http://localhost:5000/oauth2callback"
);

async function generate() {
    const url = oauth2Client.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/gmail.send"],
        prompt: "consent"
    });

    console.log("Visit this URL to authorize:", url);
}

generate();