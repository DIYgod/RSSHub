const axios = require('../../../../utils/axios');
const cheerio = require('cheerio');
const url = require('url');

const authorMap = {
    gztz: {
        all: '/2821',
    },
    jwc: {
        all: '/jwc',
        jxap: '/2847',
        ksgl: '/2895',
        xjgl: '/2902',
        wytk: '/2897',
        cjgl: '/2901',
    },
    sjjxyjlc: {
        all: '/3206',
        syjx: '/2847',
        sysjs: '/sysjs',
        xwsx: '/2909',
        xwlw: '/2910',
        kcsj: '/2911',
        cxcy: '/2913',
        xjjl: '/xjjl',
    },
    jypgc: {
        all: '/3207',
        jxyjyjxcg: '/2916',
        zljk: '/2917',
    },
    zyjsc: {
        all: '/3208',
        zyyjcjs: '/2914',
        cgsyb: '/2925',
        jxmsyyxzjjs: '/2918',
        ktjs: '/2919',
        syjx: '/2920',
    },
    gjdxswhszjd: {
        all: '/3209',
    },
    jsjxfzzx: {
        all: '/3210',
        jspx: '/2915',
    },
    zhbgs: {
        all: '/3211',
        lxkc: '/lxkc',
    },
};

const baseUrl = 'http://ugs.hrbeu.edu.cn';
const type = (filename) => filename.split('.').pop();

module.exports = async (ctx) => {
    const author = ctx.params.author || 'gztz';
    const category = ctx.params.category || 'all';
    const response = await axios.get(`${baseUrl}${authorMap[author][category]}/list.htm`);

    const { data } = response;
    const $ = cheerio.load(data);
    const links = $('.wp_article_list_table .border9')
        .map((i, el) => ({
            pubDate: new Date($('.date', el).text()).toUTCString(),
            link: url.resolve(baseUrl, $('a', el).attr('href')),
            title: $('a', el).text(),
        }))
        .get();

    const item = await Promise.all(
        [...links].slice(0, 10).map(async ({ pubDate, link, title }) => {
            if (type(link) === 'htm') {
                const { data } = await axios.get(link);
                const $ = cheerio.load(data);

                const key = link;
                const value = await ctx.cache.get(key);

                if (value) {
                    return Promise.resolve({ pubDate, link, title, value });
                }

                const description =
                    $('div.wp_articlecontent').html() &&
                    $('div.wp_articlecontent')
                        .html()
                        .replace(/src="\//g, `src="${url.resolve(baseUrl, '.')}`)
                        .replace(/href="\//g, `href="${url.resolve(baseUrl, '.')}`)
                        .trim();
                // check for some bug links.
                if (!description) {
                    return;
                }
                ctx.cache.set(key, description, 60 * 60 * 24);
                return Promise.resolve({ pubDate, link, title, description });
            } else {
                // file to download
                return Promise.resolve({ pubDate, link, title, description: '此链接为文件，点击以下载' });
            }
        })
    );

    ctx.state.data = {
        title: '哈尔滨工程大学本科生院工作通知',
        link: `${baseUrl}/2821/list.htm`,
        item: item,
    };
};
