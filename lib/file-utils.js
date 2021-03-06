var fs = require("fs");
var formidable = require("formidable");
var rimraf = require("rimraf");
var path = require("path");

function readDirectoryToObject(directoryName) {
    return new Promise(
        function(resolve, reject) {
            fs.readdir(directoryName, function(err, items) {
                if(!err && items) {
                    var directory = {};
                    directory.files = [];
                    directory.dirs = [];
        
                    items.forEach(function(itemName) {
                        var fullPathName = getFullPath(directoryName, itemName);
                        if(isFile(fullPathName)) {
                            directory.files.push({file: itemName});
                        }
                        if(isDirectory(fullPathName)) {
                            directory.dirs.push({dir: itemName});
                        }
                    });

                    resolve(directory);
                } else if (err) {
                    reject(err);
                } else {
                    reject("Could not get files in path: " + directoryName);
                }
            });
        }
    );
}

function getFullPath(directoryName, itemName) {
    var fullPath = directoryName;
    if(directoryName[directoryName.length-1] != "/") {
        fullPath += "/";
    }
    fullPath += itemName;
    return fullPath;
}

function isFile(itemName) {
    var isFile = false;

    if(fs.lstatSync(itemName).isFile()) {
        isFile = true;
    }

    return isFile;
}

function isDirectory(itemName) {
    var isDirectory = false;

    if(fs.lstatSync(itemName).isDirectory()) {
        isDirectory = true;
    }

    return isDirectory;
}

function getHtmlSource(pathToFile) {
    return fs.readFileSync(pathToFile, "utf8");
}

function readFileToJson(fileName) {
    return jsonObject = JSON.parse(fs.readFileSync(fileName, "utf8"));
}

function handleIncomingFile(req, uploadDirectory) {
    return new Promise(function(resolve, reject) {
        var form = new formidable.IncomingForm();
        form.encoding = "utf-8";
        form.uploadDir = uploadDirectory;
        form.keepExtensions = true;
        form.parse(req);
        
        form.on("fileBegin", function(name, file) {
            file.path = uploadDirectory + "/" + file.name;
        })
        
        form.on("file", function(name, file) {
            resolve(file.name);
        })
    })
}

function deleteCheckedItems(fullPath, checkedItems) {
    var deletedItemCount = 0;

    return new Promise(function(resolve, reject) {
        try {
            checkedItems.forEach(function(item) {
                var fullItemPath = path.join(fullPath, item);
                rimraf(fullItemPath, function() {
                    deletedItemCount++;
                    if(deletedItemCount == checkedItems.length) {
                        resolve()
                    }
                });
            });
        } catch(err) {
            reject(err);
        }
    });
}

function moveItems(baseDir, checkedItemsPath, checkedItemsList, newLocation) {
    var movedItemCount = 0;

    return new Promise(function(resolve, reject) {
        try {
            checkedItemsList.forEach(function(item) {
                var fullItemPath = path.join(baseDir, checkedItemsPath, item);
                var newItemPath = path.join(baseDir, newLocation, item);
                fs.rename(fullItemPath, newItemPath, function(err) {
                    movedItemCount++;
                    if(movedItemCount == checkedItemsList.length) {
                        resolve();
                    }
                });
            });
        } catch(err) {
            reject(err);
        }
    });
}

function createFolder(folderPath) {
    if(!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath);
    }
}

module.exports = {
    readDirectoryToObject: function(directoryName) {
        return readDirectoryToObject(directoryName);
    },
    getHtmlSource: function(pathToFile) {
        return getHtmlSource(pathToFile);
    },
    readFileToJson: function(fileName) {
        return readFileToJson(fileName);
    },
    handleIncomingFile: function(req, uploadDirectory) {
        return handleIncomingFile(req, uploadDirectory);
    },
    deleteCheckedItems: function(fullPath, checkedItems) {
        return deleteCheckedItems(fullPath, checkedItems);
    },
    moveItems: function(baseDir, checkedItemsPath, checkedItemsList, newLocation) {
        return moveItems(baseDir, checkedItemsPath, checkedItemsList, newLocation);
    },
    createFolder: function(folderPath) {
        return createFolder(folderPath);
    }
}
