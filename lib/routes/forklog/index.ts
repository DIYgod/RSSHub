import type { Route } from '@/types';
import got from '@/utils/got';
import { parseDate } from '@/utils/parse-date';
import timezone from '@/utils/timezone';

export const route: Route = {
    path: '/news',
    categories: ['finance'],
    example: '/forklog/news',
    radar: [
        {
            source: ['forklog.com/news'],
            target: '/news',
        },
    ],
    name: 'Новости',
    maintainers: ['raven428'],
    handler,
    url: 'forklog.com/news',
};

async function handler() {
    const response = await got('https://forklog.com/wp-content/themes/forklogv2/ajax/getPosts.php', {
        method: 'POST',
        headers: { 'x-requested-with': 'XMLHttpRequest' },
        form: { action: 'getPostsByCategory', postperpage: '333' },
    });
    const items = JSON.parse(response.body).map((post) => {
        const link = post.link;
        const title = post.title || post.text?.post_title;
        const description = post.text?.post_content.trim();
        const author = post.author_name.trim();
        let pubDate;
        if (post.text?.post_date_gmt) {
            pubDate = parseDate(`${post.text.post_date_gmt}Z`);
        } else if (post.text?.post_date) {
            pubDate = timezone(parseDate(post.text.post_date), 4);
        } else if (post.date) {
            pubDate = timezone(parseDate(post.date, 'DD.MM.YYYY HH:mm'), 4);
        }
        const imageSrc = post.image || post.image_mobile;
        const views = post.views;
        return {
            link,
            title,
            author,
            pubDate,
            description,
            category: post.category?.map((category) => category.name),
            ...(imageSrc && {
                media: {
                    thumbnail: {
                        url: imageSrc,
                        width: 250,
                        height: 250,
                    },
                },
            }),
            _extra: {
                views,
            },
        };
    });
    return {
        title: 'Forklog – Новости',
        link: 'https://forklog.com/news',
        description: 'Последние новости из мира блокчейна и криптовалют',
        item: items,
    };
}
