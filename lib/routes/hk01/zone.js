const got = require('@/utils/got');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const response = await got(`https://web-data.api.hk01.com/v2/page/zone/${id}`);
    const data = response.data;
    const list = data.sections[0].items;

    ctx.state.data = {
        title: `香港01 - ${data.zone.publishName}`,
        description: data.meta.metaDesc,
        link: data.zone.publishUrl,
        item: list.map((item) => {
            let author;
            let description;
            let pubDate;
            switch (item.type) {
                case 1:
                    author = item.data.authors && item.data.authors.map((e) => e.publishName).join(', ');
                    description = `<p>${item.data.description}</p><img style="width: 100%" src="${item.data.mainImage.cdnUrl}" />`;
                    pubDate = new Date(item.data.lastModifyTime * 1000);
                    break;
                case 2:
                    author = item.data.zonePublishName;
                    description = `${item.data.teaser.map((e) => '<p>' + e + '</p>').join('')}<img style="width: 100%" src="${item.data.mainImage.cdnUrl}" />`;
                    pubDate = new Date();
                    break;
                default:
                    break;
            }
            return {
                title: item.data.title,
                author: author,
                description: description,
                pubDate: pubDate,
                link: item.data.canonicalUrl,
            };
        }),
    };
};
