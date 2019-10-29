const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;

    const url = `https://www.taptap.com/app/${id}`;

    const app_response = await got.get(url);
    const $ = cheerio.load(app_response.data);

    const app_img = $('.header-icon-body > img').attr('src');
    const app_name = $('.breadcrumb > li.active').text();
    const app_description = $('.body-description-paragraph').text();

    const response = await got({
        method: 'get',
        url: `https://www.taptap.com/ajax/apk/v1/list-by-app?app_id=${id}&from=0&limit=10`,
        headers: {
            Referer: url,
        },
    });

    const list = response.data.data.list;

    ctx.state.data = {
        title: `TapTap 更新记录 ${app_name}`,
        description: app_description,
        link: url,
        image: app_img,
        item: list.map((item) => ({
            title: item.version_label,
            description: `${item.whatsnew.text}`,
            pubDate: new Date(item.update_date),
            link: url,
            guid: item.version_label,
        })),
    };
};
