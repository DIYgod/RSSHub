const got = require('@/utils/got');

const title = {
    recommend: '精选',
    books: '观书堂',
    courses: '在线课',
    huodongs: '观学院',
};

module.exports = async (ctx) => {
    const caty = ctx.params.caty || 'recommend';

    const rootUrl = 'https://member.guancha.cn';
    const apiUrl = `${rootUrl}/zaixianke/home`;
    const response = await got({
        method: 'get',
        url: apiUrl,
    });

    let items;

    switch (caty) {
        case 'books':
            items = response.data.data.books.map((item) => ({
                title: item.title,
                link: `${rootUrl}/guanshutang/summary.html?id=${item.id}`,
                description: `<img src="${item.cover}"><p>[${item.audio_time}] ${item.desc_short}</p>`,
                pubDate: new Date(parseInt(item.cover.split('/').pop().substr(0, 10)) * 1000).toUTCString(),
            }));
            break;

        case 'courses':
            items = response.data.data.courses.data.map((item) => {
                let description = '',
                    pubDate = new Date(0);

                for (const i of item.items) {
                    const newPubDate = new Date(i.publish_time);
                    pubDate = pubDate > newPubDate ? pubDate : newPubDate;
                    description += `<a href="${rootUrl}/zaixianke/content.html?id=${i.id}">${i.title}</a><br>`;
                }

                return {
                    title: item.name,
                    link: `${rootUrl}/zaixianke/summary.html?id=${item.id}`,
                    author: item.author_name,
                    description: `<img src="${item.cover}"><p>${item.desc_short}</p><br>${description}`,
                    pubDate: pubDate.toUTCString(),
                };
            });
            break;

        default:
            items = response.data.data[caty].map((item) => ({
                title: item.title,
                link: item.jump_url,
                author: item.author_name,
                description: `<img src="${item.big_pic}"><p>${item.summary}</p>`,
                enclosure_url: item.media_url,
                enclosure_length: item.media_size,
                enclosure_type: 'audio/mpeg',
                pubDate: new Date(item.created_at * 1000).toUTCString(),
            }));
    }

    ctx.state.data = {
        title: `观学院 - ${title[caty]}`,
        link: `${rootUrl}/index.html`,
        item: items,
    };
};
