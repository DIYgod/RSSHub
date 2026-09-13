import { escape } from 'entities';
import type { Context } from 'hono';

import ConfigNotFoundError from '@/errors/types/config-not-found';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Data, DataItem, Route } from '@/types';
import ofetch from '@/utils/ofetch';

const apiUrl = 'https://skills.sh/api/v1/skills';
const siteUrl = 'https://skills.sh';
const supportedViews = new Set(['trending', 'hot']);

type LeaderboardView = 'trending' | 'hot';

type Skill = {
    id: string;
    name: string;
    source: string;
    installs: number;
    sourceType: string;
    installUrl: string | null;
    url: string;
    installsYesterday?: number;
    change?: number;
};

type SkillsResponse = {
    data: Skill[];
    generatedAt?: string;
};

export const route: Route = {
    path: '/:view?',
    categories: ['programming'],
    example: '/skills-sh/trending',
    parameters: {
        view: '`trending`（近期增长，默认）或 `hot`（当前小时相较昨天同一小时的变化）',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    name: 'Leaderboard',
    maintainers: ['ljh12138164'],
    handler,
    description: 'skills.sh Agent Skills 热门榜单。该路由需要部署在已启用 OIDC Federation 的 Vercel 项目中。',
};

export async function handler(ctx: Context): Promise<Data> {
    const view = parseView(ctx.req.param('view'));
    const token = ctx.req.header('x-vercel-oidc-token') || process.env.VERCEL_OIDC_TOKEN;

    if (!token) {
        throw new ConfigNotFoundError('Vercel OIDC token is unavailable. Enable OIDC Federation for this Vercel project.');
    }

    const response = await ofetch<SkillsResponse>(apiUrl, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        query: {
            view,
            page: 0,
            per_page: 100,
        },
    });

    if (!response || !Array.isArray(response.data)) {
        throw new Error('skills.sh leaderboard response is invalid');
    }

    return {
        title: `skills.sh ${view === 'hot' ? 'Hot' : 'Trending'} Skills`,
        link: view === 'hot' ? `${siteUrl}/hot` : `${siteUrl}/trending`,
        description: view === 'hot' ? 'Skills gaining installs compared with the same hour yesterday.' : 'Skills with the most recent install growth.',
        lastBuildDate: response.generatedAt,
        item: response.data.map((skill, index) => toDataItem(skill, index, view)),
    };
}

export function parseView(value = 'trending'): LeaderboardView {
    if (!supportedViews.has(value)) {
        throw new InvalidParameterError('Invalid view. Supported values are "trending" and "hot".');
    }
    return value as LeaderboardView;
}

export function toDataItem(skill: Skill, index: number, view: LeaderboardView): DataItem {
    const metadata = [
        `<p><strong>Rank:</strong> ${index + 1}</p>`,
        `<p><strong>Installs:</strong> ${skill.installs.toLocaleString('en-US')}</p>`,
        `<p><strong>Source:</strong> ${escape(skill.source)}</p>`,
        `<p><strong>Source type:</strong> ${escape(skill.sourceType)}</p>`,
    ];

    if (view === 'hot' && typeof skill.change === 'number') {
        metadata.push(`<p><strong>Hourly change:</strong> ${skill.change >= 0 ? '+' : ''}${skill.change.toLocaleString('en-US')}</p>`);
    }
    if (view === 'hot' && typeof skill.installsYesterday === 'number') {
        metadata.push(`<p><strong>Same hour yesterday:</strong> ${skill.installsYesterday.toLocaleString('en-US')}</p>`);
    }
    if (skill.installUrl) {
        metadata.push(`<p><a href="${escape(skill.installUrl)}">Source repository</a></p>`);
    }

    return {
        title: `#${index + 1} ${skill.name}`,
        link: skill.url,
        guid: skill.id,
        author: skill.source.split('/', 1)[0],
        category: [skill.sourceType],
        description: metadata.join(''),
    };
}
