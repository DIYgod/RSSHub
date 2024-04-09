const got = require('@/utils/got');
const cheerio = require('cheerio');
const { parseDate } = require('@/utils/parse-date');
const { art } = require('@/utils/render');
const path = require('path');

module.exports = async (ctx) => {
    const url = 'https://vip.open.163.com';

    const list_response = await got(url);
    const $ = cheerio.load(list_response.data);
    const initialState = JSON.parse(
        $('script')
            .text()
            .match(/window\.__INITIAL_STATE__=(.*);\(function\(\)\{var/)[1]
    );

    const list = Object.values(initialState.courseindex.myModules).flatMap((mod) =>
        mod.contents.map((item) => ({
            title: `${item.title} - ${item.subtitle}`,
            author: item.authorName,
            pubDate: parseDate(item.publishTime, 'x'),
            link: `${url}/courses/${item.courseUid}/`,
            courseUid: item.courseUid,
            category: mod.name,
        }))
    );

    const items = await Promise.all(
        list.map((item) =>
            ctx.cache.tryGet(item.link, async () => {
                const {
                    data: { data },
                } = await got.post(`${url}/open/trade/pc/course/getCourseInfo.do`, {
                    form: {
                        courseUid: item.courseUid,
                        version: 1,
                    },
                });

                const $ = cheerio.load(data.courseInfo.description, null, false);
                $('img').each((_, img) => {
                    img.attribs.src = img.attribs.src.split('?')[0];
                    delete img.attribs.width;
                });

                item.category = [item.category, data.courseInfo.firstClassifyName, data.courseInfo.secondClassifyName];
                item.description = art(path.join(__dirname, '../templates/open.art'), {
                    data,
                    description: $.html(),
                });

                return item;
            })
        )
    );

    ctx.state.data = {
        title: '网易公开课 - 精品课程',
        link: url,
        item: items,
    };
};
