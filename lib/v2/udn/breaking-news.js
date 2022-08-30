const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');
const timezone = require('@/utils/timezone');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const rootUrl = 'https://udn.com/';
    const response = await got(`${rootUrl}/api/more?page=1&channelId=1&cate_id=${id}&type=breaknews`);
    const items = await Promise.all(
        response.data.lists.map(async (item) => {
            const link = `${rootUrl}${item.titleLink}`;

            const { author, description } = await ctx.cache.tryGet(link, async () => {
                const result = await got(link);
                const $ = cheerio.load(result.data);

                return {
                    author: $('.article-content__author a').text().trim(),
                    description: art(path.join(__dirname, 'templates/description.art'), {
                        description: $('.article-content__editor  p').text().trim(),
                        image: $('figure picture img').attr('src') || item.url,
                    }),
                };
            });

            return {
                title: item.title,
                author,
                description,
                pubDate: timezone(parseDate(item.time.date, 'YYYY-MM-DD HH:mm'), +8),
                link,
            };
        })
    );

    ctx.state.data = {
        title: `即時${getIdName(id)} - 聯合新聞網`,
        link: `${rootUrl}/news/breaknews/1/${id}#breaknews`,
        description: 'udn.com 提供即時新聞以及豐富的政治、社會、地方、兩岸、國際、財經、數位、運動、NBA、娛樂、生活、健康、旅遊新聞，以最即時、多元的內容，滿足行動世代的需求。',
        item: items,
    };
};

const getIdName = (id) => {
    let name = '列表';

    switch (id) {
        case '0':
            name = '精選';
            break;
        case '1':
            name = '要聞';
            break;
        case '2':
            name = '社會';
            break;
        case '3':
            name = '地方';
            break;
        case '4':
            name = '兩岸';
            break;
        case '5':
            name = '國際';
            break;
        case '6':
            name = '財經';
            break;
        case '7':
            name = '運動';
            break;
        case '8':
            name = '娛樂';
            break;
        case '9':
            name = '生活';
            break;
        case '11':
            name = '股市';
            break;
        case '12':
            name = '文教';
            break;
        case '13':
            name = '數位';
            break;
        case '99':
            name = '不分類';
            break;
        default:
            break;
    }

    return name;
};
