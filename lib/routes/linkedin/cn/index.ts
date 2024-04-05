import { Route } from '@/types';
import { parseSearchHit, parseJobPosting } from './utils';

const siteUrl = 'https://www.linkedin.cn/incareer/jobs/search';

export const route: Route = {
    path: '/cn/jobs/:keywords?',
    categories: ['other'],
    example: '/linkedin/cn/jobs/Software',
    parameters: { keywords: '搜索关键字' },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Jobs',
    maintainers: ['bigfei'],
    handler,
    description: `另外，可以通过添加额外的以下 query 参数来输出满足特定要求的工作职位：

  | 参数       | 描述                                              | 举例                                                    | 默认值  |
  | ---------- | ------------------------------------------------- | ------------------------------------------------------- | ------- |
  | \`geo\`      | geo 编码                                          | 102890883（中国）、102772228（上海）、103873152（北京） | 空      |
  | \`remote\`   | 是否只显示远程工作                                | \`true/false\`                                            | \`false\` |
  | \`location\` | 工作地点                                          | \`china/shanghai/beijing\`                                | 空      |
  | \`relevant\` | 排序方式 (true: 按相关性排序，false： 按日期排序) | \`true/false\`                                            | \`false\` |
  | \`period\`   | 发布时间                                          | \`1/7/30\`                                                | 空      |

  例如：
  [\`/linkedin/cn/jobs/Software?location=shanghai&period=1\`](https://rsshub.app/linkedin/cn/jobs/Software?location=shanghai\&period=1): 查找所有在上海的今日发布的所有 Software 工作

  **为了方便起见，建议您在 [LinkedIn.cn](https://www.linkedin.cn/incareer/jobs/search) 上进行搜索，并使用 [RSSHub Radar](https://github.com/DIYgod/RSSHub-Radar) 加载特定的 feed。**`,
};

async function handler(ctx) {
    const { title, jobs } = await parseSearchHit(ctx);
    const items = await Promise.all(jobs.map((job) => parseJobPosting(ctx, job)));
    return {
        title: `领英 - ${title}`,
        link: siteUrl,
        item: items,
    };
}
