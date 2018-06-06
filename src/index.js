var Client = require("ftp");
var fs = require('fs');
var DIRECTORY = 'd';

config = {
    host: "127.0.0.1",
    port: 5000,
    user: "user",
    password: "12345"
};

client = new Client();
client.on('ready', function () {
    list_files();
    // client.put('test', 'test.remote-copy.txt', function (err) {
    //     if (err) throw err;
    //     client.end();
    // });
});

function list_files() {
    return new Promise(function (resolve, reject) {
        client.list(function (err, list) {
            if (err) {
                reject();
            }
            list.forEach(download)
            resolve(list);
            client.end();
        });
    });
}
var current_path = "";
function download(file) {
    if (file.type == DIRECTORY) {
        log("Moving to directory => ", file.name)
        client.cwd(file.name, function (err, path) {
            if (err) throw err;
            current_path = path;
            list_files();
            console.log("teste")
            client.end();
        });
    }
    console.log(file.name)
    console.log(current_path)

    // client.get(file, function (err, stream) {
    //     if (err) throw err;
    //     stream.once('close', function () {
    //         client.end();
    //     });
    //     stream.pipe(fs.createWriteStream('test.local-copy.txt'));
    // });
}
client.connect(config)
function log(message, concat = "") {
    console.log(message, concat);
}