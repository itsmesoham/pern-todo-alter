const { google } = require("googleapis");
require("dotenv").config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GC_CLIENT_ID,
    process.env.GC_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
    refresh_token: process.env.GC_REFRESH_TOKEN
});

module.exports = oauth2Client;