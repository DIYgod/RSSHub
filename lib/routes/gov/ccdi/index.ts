import { getSubPath } from '@/utils/common-utils';
import { rootUrl, parseNewsList, parseArticle } from './utils';

export default async (ctx) => {
    const defaultPath = '/yaowenn/';

    let pathname = getSubPath(ctx).replaceAll(/(^\/ccdi|\/$)/g, '');
    pathname = pathname === '' ? defaultPath : pathname.endsWith('/') ? pathname : pathname + '/';
    const currentUrl = `${rootUrl}${pathname}`;

    const { list, title } = await parseNewsList(currentUrl, '.list_news_dl2 li', ctx);
    const items = await Promise.all(list.map((item) => parseArticle(item)));

    ctx.set('data', {
        title,
        link: currentUrl,
        item: items,
    });
};
