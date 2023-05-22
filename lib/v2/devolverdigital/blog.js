const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');
const cheerio = require('cheerio');

module.exports = async (ctx) => {
    const baseUrl = 'https://www.devolverdigital.com/blog';

    const { data: response } = await got(baseUrl);
    const $ = cheerio.load(response, { scriptingEnabled: false });

    // img resource redirection
    const allImgSpans = $('span[style="box-sizing:border-box;display:block;overflow:hidden;width:initial;height:initial;background:none;opacity:1;border:0;margin:0;padding:0;position:absolute;top:0;left:0;bottom:0;right:0"]');
    allImgSpans.each((index, element) => {
        // fix image occlusion(1)
        let style = $(element).attr('style');
        let updatedStyle = style.replace('position:absolute', '');
        $(element).attr('style', updatedStyle);

        // fix image occlusion(2)
        const img = $(element).find('img').first();
        style = img.attr('style');
        updatedStyle = style.replace('position:absolute', '');
        updatedStyle = updatedStyle.replace('width:0', '');
        updatedStyle = updatedStyle.replace('height:0', '');
        img.attr('style', updatedStyle);

        const realImg = $(element).find('img[srcset]').first();
        const srcset = realImg.attr('srcset');
        if (srcset) {
            const srcArray = srcset.split(',');
            let newSrc = '';
            for (let i = 0; i < srcArray.length; i++) {
                const src = srcArray[i].trim();
                if (src.endsWith('3840w')) {
                    newSrc = src.split(' ')[0];
                    break;
                }
            }
            img.attr('src', newSrc);
        }
    });

    const allBlogs = $('.flex.flex-col.flex-grow.h-full.bg-gray-600.text-white').children('div').has('div').toArray();

    // remove page flipping area
    allBlogs.pop();

    const items = new Array();

    for (let i = 0; i < allBlogs.length; i += 2) {
        const meta = $(allBlogs[i]);
        const content = $(allBlogs[i + 1]);

        items.push({
            title: meta.find('h1').first().text(),
            author: meta.find('span').first().text().replace('By ', ''),
            pubDate: timezone(parseDate(meta.find('time').first().text(), 'MMMM Do, YYYY'), -5),
            description: content.children('div').find('div').first().html(),
        });
    }

    ctx.state.data = {
        title: 'DevolverDigital Blog',
        link: 'https://www.devolverdigital.com/blog',
        item: items,
        image: 'https://www.devolverdigital.com/favicon.ico',
    };
};
