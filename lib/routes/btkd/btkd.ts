import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

const route: Route = {
    async handler(ctx) {
        const { user, repo = 'RSSHub' } = await ctx.req.param();
        let data = [];
        try {
            data = await ofetch(`https://api.github.com/repos/${user}/${repo}/issues`, {
                headers: {
                    accept: 'application/vnd.github.html+json',
                },
            });
        } catch {
            // 错误处理
        }

        const items = data.map((item) => ({
            title: item.title,
            link: item.html_url,
            description: item.body_html,
            pubDate: parseDate(item.created_at),
            author: item.user.login,
            category: item.labels?.map((label) => label.name) || [],
        }));

        return {
            title: `${user}/${repo} issues`,
            link: `https://github.com/${user}/${repo}/issues`,
            item: items,
        };
    },
};

export default route;
