const got = require('@/utils/got');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const link = 'http://www.zfxxgk.suzhou.gov.cn/sxqzf/szsrmzf/index_1073.html';
    const response = await got.get(link);
    const data = response.data;
    const str = cheerio.load(data);
    const strSelect = str('script:not([src])')[0].children[0].data;
    const list = strSelect.match(/(url:".)(\/.*html)"/g);

    ctx.state.data = {
        title: '苏州市政府 - 政策公开文件',
        link: link,
        item: await Promise.all(
            list &&
                list.slice(1, 10).map(async (index, item) => {
                    // 获取全文
                    const contenlhref = list[item].replace(/(url:".)(\/.*html)"/, '$2');
                    const contenlUrl = 'http://www.zfxxgk.suzhou.gov.cn/sxqzf/szsrmzf' + contenlhref;
                    const arr = await ctx.cache.tryGet(contenlUrl, async () => {
                        const fullText = await got.get(contenlUrl);
                        const fullTextData = cheerio.load(fullText.data);
                        fullTextData('h1').remove();
                        const textSelect = fullTextData('body').html();

                        // 处理图片地址
                        const regImg = /(src=")(\.\/)(.*\.jpg)/g;
                        const regpdf = /(href=")(\.\/)(.*\.pdf)/g;
                        const regUrl = /(http.*\/)(.*)(\.html)/;
                        const urlSplit = contenlUrl.replace(regUrl, '$1');
                        return new Array(fullTextData('article h2').text(), textSelect.replace(regImg, '$1' + urlSplit + '$3').replace(regpdf, '$1' + urlSplit + '$3'));
                    });
                    return {
                        title: arr[0],
                        description: arr[1],
                        link: contenlUrl,
                    };
                })
        ),
    };
};
