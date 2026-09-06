import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/kjj',
    categories: ['government'],
    example: '/gov/harbin/kjj',
    name: '政务公开',
    maintainers: ['XYenon'],
    handler,
};

async function handler() {
    const response = await ofetch('https://www.harbin.gov.cn/common/search/5b80c5ff2bb349d6948d17015fa43ddf', {
        query: {
            _isAgg: true,
            _isJson: true,
            _pageSize: 10,
            _template: 'index',
            _rangeTimeGte: '',
            _channelName: '',
            page: 1,
        },
    });

    const items = response.data.results.map((item) => ({
        title: item.title,
        link: item.url,
        description: item.contentHtml,
        pubDate: timezone(parseDate(item.publishedTimeStr), 8),
        category: item.channelName,
    }));

    return {
        title: '哈尔滨市科技局',
        link: 'https://www.harbin.gov.cn/haerbin/c106755/bmzfxxgk_fdzt.shtml?tab=fdd57e1c1ab64cfdb7172f13da422839',
        item: items,
    };
}
