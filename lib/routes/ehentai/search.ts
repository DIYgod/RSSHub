// @ts-nocheck
import cache from '@/utils/cache';
const EhAPI = require('./ehapi');

export default async (ctx) => {
    const page = ctx.req.param('page');
    let params = ctx.req.param('params');
    const routeParams = new URLSearchParams(ctx.req.param('routeParams'));
    const bittorrent = routeParams.get('bittorrent') || false;
    const embed_thumb = routeParams.get('embed_thumb') || false;
    let items;
    if (page) {
        // 如果定义了page，就要覆盖params
        params = params.replace(/&*next=[^&]$/, '').replace(/next=[^&]&/, '');
        items = await EhAPI.getSearchItems(cache, params, page, bittorrent, embed_thumb);
    } else {
        items = await EhAPI.getSearchItems(cache, params, undefined, bittorrent, embed_thumb);
    }
    let title = params;
    const match = /f_search=([^&]+)/.exec(title);
    if (match !== null) {
        title = match[1];
    }

    ctx.set(
        'data',
        EhAPI.from_ex
            ? {
                  title: title + ' - ExHentai Search ',
                  link: `https://exhentai.org/?${params}`,
                  item: items,
              }
            : {
                  title: title + ' - E-Hentai Search ',
                  link: `https://e-hentai.org/?${params}`,
                  item: items,
              }
    );
};
