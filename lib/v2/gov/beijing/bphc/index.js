const got = require('@/utils/got');
const { parseDate } = require('@/utils/parse-date');
const timezone = require('@/utils/timezone');

const mapping = {
    '/project': {
        title: '项目介绍',
        list: '/front/index/project/page',
        detail: '/front/index/project',
        link: '/#/communityDetail?id=',
    },
    '/announcement': {
        title: '通知公告',
        list: '/front/announcement/page',
        detail: '/front/announcement/',
        link: '/#/announcementList/detail?id=',
    },
};

module.exports = async (ctx) => {
    const rootUrl = 'http://gycp.bphc.com.cn:21000';
    const defaultPath = 'announcement';

    const pathname = ctx.path.replace(/(^\/beijing\/bphc|\/$)/g, '');
    const key = pathname === '' ? defaultPath : pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const obj = mapping[key];
    const currentUrl = `${rootUrl}${obj.list}`;

    const listResp = await got(currentUrl).json();
    const list = listResp.data?.records ?? [];
    const items = await Promise.all(
        list.map((item) => {
            const detail = `${rootUrl}${obj.detail}/${item.id}`;
            return ctx.cache.tryGet(detail, async () => {
                const detailResponse = await got(detail).json();
                const description = (detailResponse.data?.content || detailResponse.data?.introduction) ?? '';
                const single = {
                    title: item.title || item.fullName,
                    author: description.match(/来源：(.*?)</)?.[1].trim() ?? item.operator,
                    link: `${rootUrl}${obj.link}${item.id}`,
                    description,
                    pubDate: timezone(parseDate(item.createTime), +8),
                };
                return single;
            });
        })
    );

    ctx.state.data = {
        title: obj.title,
        link: rootUrl,
        item: items,
    };
};
