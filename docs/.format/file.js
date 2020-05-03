const fs = require('fs');

module.exports = {
    ROUTE_TYPE: 'route',
    GUIDE_TYPE: 'guide',
    LANG_CN: 'cn',
    LANG_EN: 'en',
    readFile: async (filePath) => fs.promises.readFile(filePath, { encoding: 'utf8' }),
    writeFile: async (filePath, data) => fs.promises.writeFile(filePath, data, { encoding: 'utf8' }),
};
