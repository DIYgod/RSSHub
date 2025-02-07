import { Route } from '@/types';
import got from '@/utils/got';
import './wasm-exec.js';

export const route: Route = {
    path: '/manga/update/:comicid',
    categories: ['social-media'],
    example: '/bilibili/manga/update/26009',
    parameters: { comicid: '漫画 id, 可在 URL 中找到, 支持带有`mc`前缀' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['manga.bilibili.com/detail/:comicid'],
        },
    ],
    name: '漫画更新',
    maintainers: ['hoilc'],
    handler,
};

// Based on https://github.com/SocialSisterYi/bilibili-API-collect/issues/1168#issuecomment-2620749895
async function genReqSign(query, body) {
    const wasm_resp = await got('https://s1.hdslb.com/bfs/manga-static/manga-pc/6732b1bf426cfc634293.wasm', {
        responseType: 'arrayBuffer',
    });

    const go = new Go();
    const { instance } = await WebAssembly.instantiate(wasm_resp.data, go.importObject);
    go.run(instance);
    if (void 0 === globalThis.genReqSign) {
        throw new Error('WASM function not available');
    }

    const signature = globalThis.genReqSign(query, body, Date.now());

    return signature.sign;
}

async function handler(ctx) {
    const comic_id = ctx.req.param('comicid').startsWith('mc') ? ctx.req.param('comicid').replace('mc', '') : ctx.req.param('comicid');
    const link = `https://manga.bilibili.com/detail/mc${comic_id}`;

    const spi_response = await got('https://api.bilibili.com/x/frontend/finger/spi');

    const query = 'device=pc&platform=web&nov=25';
    const body = JSON.stringify({
        comic_id: Number(comic_id),
    });

    const ultra_sign = await genReqSign(query, body);

    const response = await got({
        method: 'POST',
        url: `https://manga.bilibili.com/twirp/comic.v2.Comic/ComicDetail?${query}&ultra_sign=${ultra_sign}`,
        body,
        headers: {
            Referer: link,
            Cookie: `buvid3=${spi_response.data.data.b_3}; buvid4=${spi_response.data.data.b_4}`,
        },
    });
    const data = response.data.data;
    const author = data.author_name.join(', ');

    return {
        title: `${data.title} - 哔哩哔哩漫画`,
        link,
        image: data.vertical_cover,
        description: data.classic_lines,
        item: data.ep_list.slice(0, 20).map((item) => ({
            title: item.short_title === item.title ? item.short_title : `${item.short_title} ${item.title}`,
            author,
            description: `<img src="${item.cover}">`,
            pubDate: new Date(item.pub_time + ' +0800'),
            link: `https://manga.bilibili.com/mc${comic_id}/${item.id}`,
        })),
    };
}
