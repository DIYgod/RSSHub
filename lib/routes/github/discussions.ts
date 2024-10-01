import { Route } from '@/types';
import got from '@/utils/got';
import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import MarkdownIt from 'markdown-it';
const md = MarkdownIt({
    html: true,
    linkify: true,
});
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/discussion/:user/:repo/:state?',
    categories: ['programming'],
    example: '/github/discussion/DIYgod/RSSHub',
    parameters: {
        user: 'User name',
        repo: 'Repo name',
        state: 'The state of discussions. Can be either `open`, `closed`, `answered`, `unanswered`, `locked`, `unlocked` or `all`. Default: `all`.',
    },
    features: {
        requireConfig: [
            {
                name: 'GITHUB_ACCESS_TOKEN',
                description: 'GitHub Access Token',
            },
        ],
    },
    radar: [
        {
            source: ['github.com/:user/:repo/discussions', 'github.com/:user/:repo/discussions/:id', 'github.com/:user/:repo'],
            target: '/discussion/:user/:repo',
        },
    ],
    name: 'Repo Discussions',
    maintainers: ['waynzh'],
    handler,
};

async function handler(ctx) {
    if (!config.github || !config.github.access_token) {
        throw new ConfigNotFoundError('GitHub Discussions RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/config#route-specific-configurations">relevant config</a>');
    }
    const { user, repo, limit, state = 'all' } = ctx.req.param();
    const { answered, closed, locked } = mapStateToBooleans(state);
    const perPage = Math.min(Number.parseInt(limit) || 100, 100);

    const host = `https://github.com/${user}/${repo}/discussions`;
    const url = 'https://api.github.com/graphql';

    let filters = `first: ${perPage}`;
    if (answered !== null) {
        filters += `, answered: ${answered}`;
    }

    const response = await got({
        method: 'post',
        url,
        headers: {
            Authorization: `bearer ${config.github.access_token}`,
        },
        json: {
            query: `
            {
                repository(owner: "${user}", name: "${repo}") {
                  discussions(${filters}) {
                  nodes {
                      title,
                      author {
                        login
                      },
                      createdAt,
                      closed,
                      isAnswered,
                      locked,
                      body,
                      url
                    }
                  },
                }
              }
            `,
        },
    });

    const data = response.data.data.repository.discussions.nodes.filter((item) => (closed === null ? item : item.closed === closed)).filter((item) => (locked === null ? item : item.locked === locked));

    return {
        allowEmpty: true,
        title: `${user}/${repo} Discussions`,
        link: host,
        item: data.map((item) => ({
            title: item.title,
            author: item.author?.login ?? 'ghost',
            description: item.body ? md.render(item.body) : 'No description',
            pubDate: parseDate(item.createdAt),
            link: item.url,
        })),
    };
}

function mapStateToBooleans(state: string) {
    // 初始化布尔值
    let answered: boolean | null = null;
    let closed: boolean | null = null;
    let locked: boolean | null = null;

    // 设置布尔值，根据 state 的值
    switch (state) {
        case 'answered':
            answered = true;
            break;
        case 'unanswered':
            answered = false;
            break;
        case 'closed':
            closed = true;
            break;
        case 'open':
            closed = false;
            break;
        case 'locked':
            locked = true;
            break;
        case 'unlocked':
            locked = false;
            break;
        case 'all':
        default:
            // 保持 answered, closed, locked 为 null
            break;
    }

    return { answered, closed, locked };
}
