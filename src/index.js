var ftpClient = require("ftp-client");

config = {
    host: "127.0.0.1",
    port: 5000,
    user: "user",
    password: "12345"
};

client = new ftpClient(config);

client.connect(function() {
    console.log("connected to =>", JSON.stringify(config));
})