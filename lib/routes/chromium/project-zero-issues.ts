import type { Route } from '@/types';
import ofetch from '@/utils/ofetch';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/project-zero-issues',
    categories: ['programming'],
    example: '/chromium/project-zero-issues',
    name: 'Project Zero Issues',
    maintainers: ['hellodword'],
    handler,
};

const statusMap = {
    1: 'New',
    2: 'Assigned',
    3: 'Accepted',
    4: 'Fixed',
    5: 'Verified',
    6: 'Not Reproducible',
    7: 'Intended Behavior',
    8: 'Obsolete',
    9: 'Infeasible',
    10: 'Duplicate',
};

async function handler(ctx) {
    const baseUrl = 'https://project-zero.issues.chromium.org';
    const limit = ctx.req.query('limit') ? Number(ctx.req.query('limit')) : 50;

    const response = await ofetch(`${baseUrl}/action/issues/list`, {
        method: 'POST',
        body: [null, null, null, null, null, ['365'], ['', null, limit]],
        responseType: 'text',
    });

    const issues = JSON.parse(response.slice(")]}'".length))[0][6][0];

    return {
        title: 'project-zero issues',
        link: `${baseUrl}/hotlists/365`,
        description: 'project-zero issues',
        item: issues.map((issue) => ({
            title: `[${statusMap[issue[2][2]] ?? issue[2][2]}] ${issue[2][5]}`,
            description: issue[2][5],
            pubDate: parseDate(issue[4][0], 'X'),
            link: `${baseUrl}/issues/${issue[1]}`,
            author: issue[2][14]?.find((field) => field[0] === 1_352_754)?.[9],
        })),
    };
}
