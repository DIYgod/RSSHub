import { Route } from '@/types';

import Parser from 'rss-parser';
import { art } from '@/utils/render';
import path from 'node:path';
import dayjs from 'dayjs';
import { fallback, queryToBoolean } from '@/utils/readable-social';
import InvalidParameterError from '@/errors/types/invalid-parameter';

const titleRegex = /(.+)\s+is\s+([A-Z]+)\s+\((.+)\)/;

const formatTime = (s) => {
    const duration = dayjs.duration(s - 0, 'seconds');
    const days = duration.days();
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    } else {
        return `${seconds}s`;
    }
};

class Monitor {
    constructor(name, uptime = 0, downtime = 0) {
        this.name = name;
        this.uptime = uptime;
        this.downtime = downtime;
    }

    uptimeRatio() {
        return this.uptime / (this.uptime + this.downtime);
    }

    downtimeRatio() {
        return this.downtime / (this.uptime + this.downtime);
    }

    up(time) {
        this.uptime += time - 0;
    }

    down(time) {
        this.downtime += time - 0;
    }
}

const rootURL = 'https://rss.uptimerobot.com';

export const route: Route = {
    path: '/rss/:id/:routeParams?',
    categories: ['forecast'],
    example: '/uptimerobot/rss/u358785-e4323652448755805d668f1a66506f2f',
    parameters: {
        id: 'the last part of your RSS URL (e.g. `u358785-e4323652448755805d668f1a66506f2f` for `https://rss.uptimerobot.com/u358785-e4323652448755805d668f1a66506f2f`)',
        routeParams: 'extra parameters, see the table below',
    },
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['rss.uptimerobot.com/:id'],
            target: '/rss/:id',
        },
    ],
    name: 'RSS',
    maintainers: ['Rongronggg9'],
    handler,
    description: `| Key    | Description                                                              | Accepts        | Defaults to |
| ------ | ------------------------------------------------------------------------ | -------------- | ----------- |
| showID | Show monitor ID (disabling it will also disable link for each RSS entry) | 0/1/true/false | true        |`,
};

async function handler(ctx) {
    const id = ctx.req.param('id');
    const routeParams = Object.fromEntries(new URLSearchParams(ctx.req.param('routeParams')));
    const showID = fallback(undefined, queryToBoolean(routeParams.showID), true);

    const rssUrl = `${rootURL}/${id}`;
    const rss = await new Parser({
        customFields: {
            item: ['details:duration'],
        },
    }).parseURL(rssUrl);

    const monitors = {};

    const items = rss.items.toReversed().map((item) => {
        const titleMatch = item.title.match(titleRegex);
        if (!titleMatch) {
            throw new InvalidParameterError('Unexpected title, please open an issue.');
        }
        const [monitorName, status, id] = titleMatch.slice(1);

        if (id !== item.link) {
            throw new InvalidParameterError('Monitor ID mismatch, please open an issue.');
        }

        // id could be a URL, a domain, an IP address, or a hex string. fix it
        let link;
        try {
            link = !id.startsWith('http') && id.includes('.') ? new URL(`http://${id}`).href : new URL(id).href;
        } catch {
            // ignore
        }

        const duration = item['details:duration'];
        const monitor = (monitors[monitorName] = monitors[monitorName] || new Monitor(monitorName));

        if (status === 'UP') {
            monitor.up(duration);
        } else if (status === 'DOWN') {
            monitor.down(duration);
        } else {
            throw new InvalidParameterError('Unexpected status, please open an issue.');
        }

        const desc = art(path.join(__dirname, 'templates/rss.art'), {
            status,
            link,
            id: showID ? id : null,
            duration: formatTime(duration),
            uptime: formatTime(monitor.uptime),
            downtime: formatTime(monitor.downtime),
            uptime_ratio: Number(monitor.uptimeRatio()).toLocaleString(undefined, {
                style: 'percent',
                minimumFractionDigits: 2,
            }),
            details: item.content,
        });

        return {
            ...item,
            title: `[${status}] ${monitorName}`,
            description: desc,
            link: showID ? link : null,
        };
    });

    return {
        title: 'Uptime Robot - RSS (enhanced)',
        description: rss.description,
        link: rssUrl,
        item: items,
        image: 'https://uptimerobot.com/favicon.ico',
    };
}
