const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { getElementChildrenInnerText } = require('./utils');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const got = require('@/utils/got');

module.exports = async (ctx) => {
    const dateFormatted = dayjs().utcOffset(8).format('YYYYMMDD');

    const baseUrl = `http://mrdx.cn/content/${dateFormatted}`;
    const link = `${baseUrl}/Page01DK.htm`;

    const indexPageResponse = await got({
        url: link,
        method: 'get',
    });
    const $ = cheerio.load(indexPageResponse.data);

    // 当日所有文章Url在<a>的`daoxiang` attribute中
    // 其站点使用**非标准**的HTML语法
    // eg: `<a class="foo" daoxiang="foo-bar.htm">Lorem ipsum</a>`
    const passagesList = $('.listdaohang > ul > li a')
        .toArray()
        .map((item) => ({
            link: new URL(`${baseUrl}/${item.attribs.daoxiang}`).href,
        }));

    const passages = await Promise.all(
        passagesList.map((passage) =>
            ctx.cache.tryGet(passage.link, async () => {
                const response = await got({
                    url: passage.link,
                    method: 'get',
                });

                const $ = cheerio.load(response.data);

                // 标题在`h2`,`h3`,`h4`,`h5`中，有多余空格和换行符
                // 但是Middleware会处理
                const title =
                    getElementChildrenInnerText($('.bggray > .margin15 > h2')[0]) +
                    getElementChildrenInnerText($('.bggray > .margin15 > h3')[0]) +
                    getElementChildrenInnerText($('.bggray > .margin15 > h4')[0]) +
                    getElementChildrenInnerText($('.bggray > .margin15 > h5')[0]);

                // 作者和发布时间
                // 中间用超多空格分隔
                // 头尾均有多余空格
                // eg: 新华每日电讯     2022年12月21日
                const [author, pubDate] = getElementChildrenInnerText($('.shijian')[0])
                    .split(' ')
                    .filter((item) => item !== '')
                    .map((item) => item.trim());

                const content = $('.contenttext').html();

                return {
                    title,
                    author,
                    pubDate: parseDate(pubDate, 'YYYY年MM月DD日'),
                    guid: passage.link,
                    link: passage.link,
                    description: content,
                };
            })
        )
    );

    ctx.state.data = {
        title: '新华每日电讯',
        link,
        item: passages,
        description:
            '中国报纸发行前三强。位列《人民日报》，《参考消息》之后。《新华每日电讯》是新华社出版的一份新闻电讯报，1993年创办，具有很高的权威性和准确性，有“一报在手，便知天下”之美誉。《新华每日电讯》为对开八版日报，集中刊登[新华社]每天向国内播发的电讯稿及图片稿。打开《新华每日电讯》，中国和全世界每天发生的重大事件便将一目了然。在人类生活节奏日益加快的当今世界，《新华每日电讯》以最便捷、最醒目的方式为公众提供最重要的新闻报道，受到公众的喜爱和拥护。',
    };
};
