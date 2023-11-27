import fs from 'fs/promises';

export default {
    ROUTE_TYPE: 'route',
    GUIDE_TYPE: 'guide',
    NAV_TYPE: 'nav',
    LANG_CN: 'zh-CN',
    LANG_EN: 'en-US',
    readFile: async (filePath) => await fs.readFile(filePath, { encoding: 'utf8' }),
    writeFile: async (filePath, data) => await fs.writeFile(filePath, data, { encoding: 'utf8' }),
};
