import 'dayjs/locale/zh-cn.js';

import { load } from 'cheerio';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat.js';
import { JSDOM } from 'jsdom';

import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

import { renderEshopCnDescription } from './templates/eshop-cn';

dayjs.extend(localizedFormat);

function nuxtReader(data) {
    let nuxt: Record<string, unknown>;
    try {
        const dom = new JSDOM(data, {
            runScripts: 'dangerously',
        });
        nuxt = dom.window.__NUXT__.data[0];
    } catch {
        throw new Error('Nuxt 框架信息提取失败，请报告这个问题');
    }

    return nuxt;
}

function generateImageLink(link) {
    return `<img src="${link}"><br/>`;
}

async function loadContent(link) {
    const response = await got(link);

    const data = response.data;

    const $ = load(data); // 使用 cheerio 加载返回的 HTML
    const description = $('.description').html();

    return {
        content: description,
    };
}

async function loadNews(link) {
    const response = await got(link);

    const data = response.data;

    const $ = load(data);
    let description = $('.detail-body-container').html();
    const date = $('.topics-articleHead__date').text();
    description = description.replaceAll('src="/topics/', 'src="https://www.nintendo.com.hk/topics/');
    return {
        content: description,
        pubDate: parseDate(date, 'YYYY.M.D'),
    };
}

const ProcessItem = (list, caches) =>
    Promise.all(
        list.map(async (item) => {
            const other = await caches.tryGet(item.link, () => loadContent(item.link));
            return { ...item, ...other };
        })
    );

const ProcessNews = (list, caches) =>
    Promise.all(
        list.map(async (item) => {
            const other = await caches.tryGet(item.url, () => loadNews('https://www.nintendo.com.hk' + item.url));
            return { ...item, ...other };
        })
    );

/*
    Software Item Example
{
    "nsUid": "70010000027088",
    "gameProductCode": "HAC-P-ADALB",
    "name": "新 超级马力欧兄弟U 豪华版",
    "price": "299",
    "currency": "CNY",
    "images": ["//switch-cn.gtgres.com/global-images/c247f0e0-1654-11ea-9b40-236e671bca9e.png", "//switch-cn.gtgres.com/global-images/c62e52d0-1654-11ea-9b40-236e671bca9e.jpg", "//switch-cn.gtgres.com/global-images/c8ec6160-1654-11ea-9b40-236e671bca9e.jpg", "//switch-cn.gtgres.com/global-images/cb84e690-1654-11ea-9b40-236e671bca9e.jpg", "//switch-cn.gtgres.com/global-images/cdc1b730-1654-11ea-9b40-236e671bca9e.jpg", "//switch-cn.gtgres.com/global-images/cfd57c00-1654-11ea-9b40-236e671bca9e.jpg", "//switch-cn.gtgres.com/global-images/d1fe4f70-1654-11ea-9b40-236e671bca9e.jpg"],
    "movies": [],
    "purchaseUrls": [{
        "key": "JD",
        "url": "https://item.jd.com/100010400326.html"
    }, {
        "key": "TM",
        "url": "https://detail.tmall.com/item.htm?id=608916438547"
    }],
    "descriptionTitle": "2D超级马力欧全新体验，同享欢乐时光",
    "descriptionContent": "《新 超级马力欧兄弟U 豪华版》是2D超级马力欧横版卷轴动作游戏。\\n\\n游戏包括《新 超级路易吉U》和《新 超级马力欧兄弟U》共164个关卡，马力欧一行需要前往被酷霸王占领的桃花公主城堡，利用多种新奇的能力强化，与可靠有趣的伙伴，在丰富多彩的世界中展开冒险。在《新 超级路易吉U》中，关卡难度更高，限时更短，角色跳跃能力更强但也更易打滑，非常适合喜欢挑战的玩家。\\n\\n游戏中有“马力欧”、“路易吉”、“奇诺比奥”、“偷天兔”和“奇诺比珂”5个角色供你选择，其中“奇诺比珂”与“偷天兔”拥有非常适合新手的特殊能力，即使不擅长动作游戏，也可以轻松游玩。\\n\\n除了故事模式外，游戏还提供课题模式、加倍模式和金币对战多种丰富的玩法。游戏支持最多4人一起游玩，快与伙伴分享Joy-Con™，一起趣玩吧！",
    "sizeNum": "2.1",
    "sizeUnit": "GB",
    "playMode": ["tv", "tabletop", "handheld"],
    "normalPlayersNum": {
        "min": 1,
        "max": 4
    },
    "localPlayersNum": {
        "min": 0,
        "max": 0
    },
    "internatPlayersNum": {
        "min": 0,
        "max": 0
    },
    "handleSupport": "Nintendo Switch专业手柄",
    "platform": "Nintendo Switch",
    "developer": "Nintendo",
    "publisher": "任天堂",
    "genre": ["动作", "冒险", "家庭", "多人"],
    "releaseDatetime": 1575907200000,
    "supportLanguages": ["简体中文"],
    "colors": {
        "words": "3c3c3c",
        "entrance": "e60012",
        "background": "e8ebef"
    },
    "copyright": {
        "publishCompany": "上海电子出版有限公司",
        "operateCompany": "深圳市腾讯计算机系统有限公司",
        "copyrightNotice": "© 2012-2019 Nintendo",
        "isbn": "978-7-498-06914-6",
        "gapp": "国新出审[2019]2990号",
        "copyrightNumber": "电出字09-2019-031"
    }
}
*/
const ProcessItemChina = (list, cache) =>
    Promise.all(
        list.map(async (item) => {
            if (!item.link.startsWith('https://www.nintendoswitch.com.cn/software/')) {
                return item;
            }
            const n = await cache.tryGet(item.link, async () => nuxtReader((await got(item.link)).data));
            const software = n.data;
            return {
                ...item,
                category: [...software.supportLanguages, ...software.genre, ...software.playMode],
                description: renderEshopCnDescription({
                    item,
                    software,
                    releaseDatetime: dayjs(software.releaseDatetime).locale('zh-cn').format('lll'),
                }),
            };
        })
    );

const ProcessNewsChina = (list, cache) =>
    Promise.all(
        list.map(async (item) => {
            const n = await cache.tryGet(item.link, async () => nuxtReader((await got(item.link)).data));
            return {
                ...item,
                description: item.description + n.newsData.content,
                category: n.newsData.category,
                pubDate: parseDate(n.newsData.releaseTime, 'x'),
            };
        })
    );

export default { ProcessItem, ProcessNews, ProcessNewsChina, ProcessItemChina, nuxtReader, generateImageLink };
