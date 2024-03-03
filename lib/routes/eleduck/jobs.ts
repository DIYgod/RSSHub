// @ts-nocheck
import cache from '@/utils/cache';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';

export default async (ctx) => {
    const { data: response } = await got('https://svc.eleduck.com/api/v1/posts', {
        searchParams: {
            category: 5,
        },
    });

    const data = response.posts.map((item) => ({
        id: item.id,
        title: item.title,
        link: `https://eleduck.com/posts/${item.id}`,
        author: item.user.nickname,
        description: item.summary,
        pubDate: parseDate(item.published_at),
        category: item.tags.map((tag) => tag.name),
    }));

    const out = await Promise.all(
        data.map((job) =>
            cache.tryGet(job.link, async () => {
                const { data: jobDetail } = await got(`https://svc.eleduck.com/api/v1/posts/${job.id}`);

                job.description = jobDetail.post.content;

                return job;
            })
        )
    );

    ctx.set('data', {
        title: '招聘 | 电鸭社区',
        link: 'https://eleduck.com/category/5',
        item: out,
    });
};
