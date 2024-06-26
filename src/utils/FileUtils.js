const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

module.exports = class FileUtils 
{
    static async requireDir(dirPath, success, error, recursive = true) 
    {
        const files = await FileUtils.readdir(dirPath);
        const filesObject = {};

        return Promise.all(files.map(async file => {
            const fullPath = path.resolve(dirPath, file);
            if (file.match(/\.(js|json)$/)) 
            {
                try 
                {
                    delete require.cache[require.resolve(fullPath)];
                    const required = require(fullPath);
                    if (success) await success(required, path.join(dirPath, file));

                    filesObject[file] = required;
                    return required;
                } 
                catch(e) 
                {
                    error(e);
                }
            } 
            else if (recursive) 
            {
                const isDirectory = await FileUtils.stat(fullPath).then(f => f.isDirectory());
                if (isDirectory) 
                {
                    return FileUtils.requireDir(path.join(dirPath, file), success, error);
                }
            }
        }))
            .then(() => filesObject).catch(console.error);
    }
}

module.exports.readdir = promisify(fs.readdir);
module.exports.readFile = promisify(fs.readFile);
module.exports.stat = promisify(fs.stat);