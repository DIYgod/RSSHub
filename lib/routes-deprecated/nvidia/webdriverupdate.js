const got = require('@/utils/got');
const plist = require('plist');

module.exports = async (ctx) => {
    const url = 'https://gfe.nvidia.com/mac-update';

    const res = await got({
        method: 'get',
        url,
    });

    const list = plist.parse(res.data).updates;

    const resultItem = list.map((i) => {
        const item = {};
        item.title = i.version;

        item.description = i.version;
        item.guid = i.checksum;
        item.link = i.downloadURL;
        return item;
    });

    ctx.state.data = {
        title: 'Nvidia WebDriver Update',
        link: url,
        item: resultItem,
    };
};
