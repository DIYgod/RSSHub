const got = require('@/utils/got');
const domain = 'manhua.fffdm.com';
const host = `https://${domain}`;
const { art } = require('@/utils/render');
const path = require('path');

const get_pic = (id, chapter, caches) => {
    const url = `${host}/api/manhua/${id}/${chapter}`;
    return caches.tryGet(url, async () => {
        const response = await got.get(url);
        const data = response.data;
        const comicTitle = data.mhinfo.title;
        const chapterTitle = data.title;
        const pics = data.cont;
        return { comicTitle, chapterTitle, pics };
    });
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
    const response = await got.get(`${host}/api/manhua/${id}`);
    const data = response.data;

    const chapter_detail = await Promise.all(
        data.mhlist.splice(0, count).map(async (item) => {
            const pic_content = await get_pic(id, item.url, ctx.cache);
            return {
                title: pic_content.chapterTitle,
                description: art(path.resolve(__dirname, '../templates/manhua.art'), { pic: pic_content.pics, cdn }),
                link: `${host}/api/manhua/${id}/${item.url}`,
                comicTitle: pic_content.comicTitle,
            };
        })
    );
    ctx.state.data = {
        title: '风之动漫 - ' + chapter_detail[0].comicTitle,
        link: `${host}/${id}`,
        description: '风之动漫',
        item: chapter_detail,
    };
};
