var Client = require("ftp");
var fs = require('fs');
var path = require('path');
var DIRECTORY = 'd';
var dirList = [];
var fileList = [];
var DEFAULT_DIR = "/home/lima/FTP_Receiver"
config = {
    host: "127.0.0.1",
    port: 5000,
    user: "user",
    password: "12345"
};

client = new Client();
client.on('ready', function () {
    list_files().then(function (data) {
        dirList = dirList.concat(data.dirList)
        fileList = fileList.concat(data.fileList)
        listDirs(data.dirList, '');
    });
});

// client.on("close", function () {
//     console.log(dirList);
//     console.log(fileList)
// })

function listDirs(dirs, root) {
    var promises = [];
    dirs.forEach(function (dir) {
        promises.push(listDir(dir, root));
    });
    Promise.all(promises).then(function (data) {
        if (!data) {
            console.log("close")
            client.end();
        }
        data.forEach(function (res) {
            if (res.fileList) {
                fileList = fileList.concat(res.fileList);
            }
            if (res.dirList && res.dirList.length > 0) {
                dirList = dirList.concat(res.dirList);
                listDirs(res.dirList, res.whereis);
            } else {
                // console.log("if doesn't return dirs, it will close")
                download();
                // client.end();
            }
        })
    })
}

function download() {
    var promises = [];
    fileList.forEach(function (data) {
        promises.push(getFile(data));
    })
    Promise.all(promises).then(function () {
        console.log("success");
        client.end();
    })
}

function getFile(file) {
    return new Promise(function (resolve, reject) {
        var file_path = [file.whereis, file.name].join("/");
        client.get(file_path, function (err, stream) {
            if (err) throw err;
            stream.once('close', function () { resolve(); });
            var file_name = DEFAULT_DIR + file_path + '.local-copy.txt'
            if (ensureDirectoryExistence(file_name)) {
                stream.pipe(fs.createWriteStream(file_name));
            }
        });
    })
}

function list_files(whereis) {
    return new Promise(function (resolve, reject) {
        client.list(function (err, files) {
            if (err) { reject(); }
            var dirList = [];
            var fileList = [];
            files.forEach(function (file) {
                if (file.type == DIRECTORY) {
                    dirList.push(file);
                    return;
                }
                file.whereis = whereis;
                fileList.push(file);
            });
            resolve({ dirList: dirList, fileList: fileList });
        });
    })
}

function listDir(folder, root) {
    var file_path = [root, folder.name].join("/");
    return new Promise(function (resolve, reject) {
        client.cwd(file_path, function (err, path) {
            if (err) throw err;
            list_files(file_path).then(function (data) {
                resolve(Object.assign({}, data, { whereis: file_path }))
            }).catch(function (err) {
                reject(err);
            })
        });
    });
}

function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}
client.connect(config);