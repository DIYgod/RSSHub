import { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { config } from '@/config';
import { load } from 'cheerio';

async function handler(ctx) {
    const { params } = ctx.req.param();
    const baseUrl = 'https://hanime1.me';

    // 提取参数
    const searchParams = new URLSearchParams(params);
    const query = searchParams.get('query') || '';
    const genre = searchParams.get('genre') || '';
    const broad = searchParams.get('broad') || '';
    const tags = searchParams.getAll('tags[]');
    const sort = searchParams.get('sort') || '';
    const year = searchParams.get('year') || '';
    const month = searchParams.get('month') || '';

    let link = `${baseUrl}/search?query=${query}&genre=${genre}&broad=${broad}&sort=${sort}&year=${year}&month=${month}`;
    for (const tag of tags) {
        link += `&tags[]=${tag}`;
    }

    const response = await ofetch(link, {
        headers: {
            referer: baseUrl,
            'user-agent': config.trueUA,
        },
    });
    const $ = load(response);

    const target = '.content-padding-new .row.no-gutter';

    const items = $(target)
        .find('.search-doujin-videos.hidden-xs') // 过滤掉重复的元素
        .toArray()
        .map((item) => {
            const element = $(item);
            const title = element.attr('title');
            const videoLink = element.find('a.overlay').attr('href');
            const imageSrc = element.find('img[style*="object-fit: cover"]').attr('src'); // 选择缩略图

            return {
                title,
                link: videoLink,
                description: `<img src="${imageSrc}">`,
            };
        });

    // 最多显示三个标签
    const maxTagsToShow = 3;
    const displayedTags = tags.slice(0, maxTagsToShow).join(', ') + (tags.length > maxTagsToShow ? ', ...' : '');

    const feedTitle = `Hanime1 搜索结果` + (genre ? ` | 类型: ${genre}` : '') + (query ? ` | 关键词: ${query}` : '') + (tags.length ? ` | 标签: ${displayedTags}` : '');

    return {
        title: feedTitle,
        link,
        item: items,
    };
}

export const route: Route = {
    path: '/search/:params',
    name: '搜索结果',
    maintainers: ['kjasn'],
    example: '/hanime1/search/tags%5B%5D=%E7%B4%94%E6%84%9B&',
    categories: ['anime'],
    parameters: {
        params: {
            description: `
| 参数                | 说明                              | 示例或可选值                                                                                                          |
| ------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| \`query\`           | 搜索框输入的内容                  | 任意值都可以，例如：\`辣妹\`                                                                                          |
| \`genre\`           | 番剧类型，默认为\`全部\`          | 可选值有：\`全部\` / \`裏番\` / \`泡麵番\` / \`Motion+Anime\` / \`3D動畫\` / \`同人作品\` / \`MMD\` / \`Cosplay\`     |
| \`tags[]\`          | 标签                              | 可选值过多，不一一列举，详细请查看原网址。例如：\`tags[]=純愛&tags[]=中文字幕\`                                       |
| \`broad\`           | 标签模糊匹配，默认为 \`off\`      | \`on\`（模糊匹配，包含任一标签） / \`off\`（精确匹配，包含全部标签）                                                  |
| \`sort\`            | 搜索结果排序，默认 \`最新上市\`   | \`最新上市\` / \`最新上傳\` / \`本日排行\` / \`本週排行\` / \`本月排行\` / \`觀看次數\` / \`讚好比例\` / \`他們在看\` |
| \`year\`, \`month\` | 筛选发布时间，默认为 \`全部时间\` | 例如：\`year=2025&month=5\`                                                                                           |

::: tip
如果你不确定标签或类型的具体名字，可以直接去原网址选好筛选条件后，把网址中的参数复制过来使用。例如： \`https://hanime1.me/search?query=&genre=裏番&broad=on&sort=最新上市&tags[]=純愛&tags[]=中文字幕\`，\`/search?\`后面的部分就是参数了,最后得到**类似**这样的路由 \`https://rsshub.app/hanime1/search/query=&genre=裏番&broad=on&sort=最新上市&tags[]=純愛&tags[]=中文字幕\`
:::
`,
        },
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    handler,
};
