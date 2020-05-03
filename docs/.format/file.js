const fs = require('fs');

module.exports = {
    ROUTE_TYPE: 'route',
    GUIDE_TYPE: 'guide',
    NAV_TYPE: 'nav',
    LANG_CN: 'zh-CN',
    LANG_EN: 'en-US',
    readFile: async (filePath) => fs.promises.readFile(filePath, { encoding: 'utf8' }),
    writeFile: async (filePath, data) => fs.promises.writeFile(filePath, data, { encoding: 'utf8' }),
};
