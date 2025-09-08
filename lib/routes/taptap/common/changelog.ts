import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import { getRootUrl, appDetail, X_UA } from '../utils';

export async function handler(ctx) {
    const requestPath = ctx.req.path.replace('/taptap', '');
    const isIntl = requestPath.startsWith('/intl/');
    const id = ctx.req.param('id');
    const lang = ctx.req.param('lang') ?? (isIntl ? 'en_US' : 'zh_CN');

    const url = `${getRootUrl(isIntl)}/app/${id}`;

    const detail = await appDetail(id, lang, isIntl);

    const appImg = detail.app.icon.original_url;
    const appName = detail.app.title;
    const appDescription = `${appName}${detail.app.developers ? ' by' + detail.app.developers.map((item) => item.name).join(' & ') : ''}`;

    const response = await ofetch(`${getRootUrl(isIntl)}/webapiv2/apk/v1/list-by-app?app_id=${id}&from=0&limit=10&${X_UA(lang)}`, {
        headers: {
            Referer: url,
        },
    });

    const list = response.data.list;

    return {
        title: `TapTap 更新记录 ${appName}`,
        description: appDescription,
        link: url,
        image: appImg,
        item: list.map((item) => ({
            title: `${appName} / ${item.version_label}`,
            description: item.whatsnew.text,
            pubDate: parseDate(item.update_date, 'X'),
            link: url,
            guid: item.version_label,
        })),
    };
}
