const got = require('@/utils/got');

module.exports = async (ctx) => {
    const site = ctx.params.site;
    const only_media = ctx.params.only_media ? 'true' : 'false';

    const url = `http://${site}/api/v1/timelines/public?local=true&only_media=${only_media}`;

    const response = await got.get(url);
    const list = response.data;

    const ProcessFeed = (data) =>
        data.map((item) => {
            const title = item.content
                .replace(/<span.*?>|<\/span.*?>/gm, '')
                .replace(/<(?:.|\n)*?>/gm, '\n')
                .split('\n')
                .filter((s) => s !== '')[0];

            const media = item.media_attachments
                .map((item) => {
                    switch (item.type) {
                        case 'gifv':
                            return `<br><video src="${item.url}" autoplay loop>GIF</video>`;
                        case 'video':
                            return `<br><video src="${item.url}" controls loop>Video</video>`;
                        case 'image':
                            return `<br><img src="${item.url}">`;
                        default:
                            return '';
                    }
                })
                .join('');

            return {
                title: title,
                author: item.account.display_name,
                description: item.content + media,
                pubDate: new Date(item.created_at).toUTCString(),
                link: item.uri,
            };
        });

    ctx.state.data = {
        title: `Local Public${ctx.params.only_media ? ' Media' : ''} Timeline on ${site}`,
        link: `http://${site}`,
        item: ProcessFeed(list),
    };
};
