import { createHash } from 'node:crypto';

import { load } from 'cheerio';

import type { Route } from '@/types';
import { generateHeaders } from '@/utils/header-generator';
import ofetch from '@/utils/ofetch';

import { evaluateJsl } from './jsl';

export const route: Route = {
    path: '/',
    categories: ['programming'],
    example: '/ichunqiu',
    features: {
        antiCrawler: true,
    },
    name: '资讯',
    maintainers: ['8430177'],
    handler,
};

const solveJsl = ({ bts, chars, ct, ha }) => {
    for (const a of chars) {
        for (const b of chars) {
            const answer = bts[0] + a + b + bts[1];
            if (createHash(ha).update(answer).digest('hex') === ct) {
                return answer;
            }
        }
    }
    throw new Error('Failed to solve __jsl_clearance_s');
};

async function handler() {
    const baseSite = 'https://bbs.ichunqiu.com/';
    const link = `${baseSite}portal.php`;

    const cookies = new Map();
    const headers = generateHeaders();
    const fetchPage = async () => {
        const response = await ofetch.raw<string, 'text'>(link, {
            headers: {
                ...headers,
                cookie: [...cookies].map(([name, value]) => `${name}=${value}`).join('; '),
            },
            ignoreResponseError: true,
            responseType: 'text',
        });
        for (const cookie of response.headers.getSetCookie()) {
            const [name, value] = cookie.split(';', 1)[0].split('=', 2);
            cookies.set(name, value);
        }
        return response._data!;
    };

    // obtain __jsluid_s from set-cookie header
    let body = await fetchPage();
    for (let round = 0; round < 5 && !body.includes('class="module'); round++) {
        const assignment = body.match(/document\.cookie=(.+?);location\.href/s);
        const challenge = body.match(/go\((\{.+?\})\)/s);
        if (assignment) {
            // get 1st __jsl_clearance_s
            const [name, value] = evaluateJsl(assignment[1]).split(';', 1)[0].split('=', 2);
            cookies.set(name, value);
        } else if (challenge) {
            // get 2nd __jsl_clearance_s
            const puzzle = JSON.parse(challenge[1]);
            cookies.set(puzzle.tn, solveJsl(puzzle));
        } else {
            throw new Error('Unrecognized response');
        }
        // oxlint-disable-next-line no-await-in-loop
        body = await fetchPage();
    }

    const $ = load(body);

    return {
        title: 'i春秋学院 ~ 资讯',
        link: baseSite,
        description: 'i春秋学院 ~ 资讯',
        item: $('.module dl')
            .toArray()
            .map((item) => {
                const $item = $(item);
                const a = $item.find('dt a[title]');
                const title = a.attr('title');
                if (!title) {
                    return;
                }
                return {
                    title,
                    link: new URL(a.attr('href')!, baseSite).href,
                    description: $item.find('dd:not(.m)').text().trim(),
                };
            })
            .filter((item) => item !== undefined),
    };
}
