const got = require('@/utils/got');
const domain = 'manhua.fffdm.com';
const host = `https://${domain}`;
const { art } = require('@/utils/render');
const path = require('path');
const { parseDate } = require('@/utils/parse-date');

const get_pic = async (url) => {
    const response = await got(url);
    const data = response.data;
    return {
        comicTitle: data.mhinfo.title,
        chapterTitle: data.title,
        pics: data.cont,
        pubDate: parseDate(data.mh.time),
    };
};

module.exports = async (ctx) => {
    const id = ctx.params.id;
    const count = ctx.query.limit || 99999;
    const cdnNum = ctx.params.cdn || 5;
    let cdn = '';
    if (!isNaN(parseInt(cdnNum)) && 1 <= parseInt(cdnNum) && parseInt(cdnNum) <= 5) {
        cdn = `https://p${cdnNum}.fzacg.com`;
    } else {
        cdn = `https://p5.fzacg.com`;
    }

    // 获取漫画清单
    const response = await got(`${host}/api/manhua/${id}`);
    const data = response.data;

    const chapter_detail = await Promise.all(
        data.mhlist.splice(0, count).map((item) => {
            const url = `${host}/api/manhua/${id}/${item.url}`;
            return ctx.cache.tryGet(url, async () => {
                const picContent = await get_pic(url);
                return {
                    title: picContent.chapterTitle,
                    description: art(path.join(__dirname, '../templates/manhua.art'), { pic: picContent.pics, cdn }),
                    link: `${host}/${id}/${item.url}/`,
                    comicTitle: picContent.comicTitle,
                    pubDate: picContent.pubDate,
                };
            });
        })
    );
    ctx.state.data = {
        title: '风之动漫 - ' + chapter_detail[0].comicTitle,
        link: `${host}/${id}`,
        description: '风之动漫',
        item: chapter_detail,
    };
};
