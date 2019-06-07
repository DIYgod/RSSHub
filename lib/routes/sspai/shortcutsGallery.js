const got = require('@/utils/got');

module.exports = async (ctx) => {
    const {
        data: { data: categories },
    } = await got.get('https://shortcuts.sspai.com/api/v1/user/workflow/all/get');

    const items = [];

    for (const category of categories) {
        for (const shortcut of category.data || []) {
            items.push({
                title: shortcut.name,
                description: `作者：<a href="${shortcut.author_url || '#'}">${shortcut.author_id}</a><br/>${decodeURIComponent((shortcut.description || '').replace(/\+/g, '%20'))}`,
                pubDate: new Date(shortcut.utime * 1000).toUTCString(),
                guid: shortcut.id,
                link: shortcut.url,
            });
        }
    }

    ctx.state.data = {
        title: 'Shortcuts Gallery - 少数派',
        link: 'https://shortcuts.sspai.com/#/main/workflow',
        description: 'Shortcuts Gallery - 少数派',
        item: items,
    };
};
