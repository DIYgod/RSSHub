// @ts-nocheck
import { getCurrentPath } from '@/utils/helpers';
const __dirname = getCurrentPath(import.meta.url);

const Parser = require('rss-parser');
import { art } from '@/utils/render';
import * as path from 'node:path';
const dayjs = require('dayjs');
import { fallback, queryToBoolean } from '@/utils/readable-social';

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

export default async (ctx) => {
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

    const items = rss.items.reverse().map((item) => {
        const titleMatch = item.title.match(titleRegex);
        if (!titleMatch) {
            throw new Error('Unexpected title, please open an issue.');
        }
        const [monitorName, status, id] = titleMatch.slice(1);

        if (id !== item.link) {
            throw new Error('Monitor ID mismatch, please open an issue.');
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
            throw new Error('Unexpected status, please open an issue.');
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

    ctx.set('data', {
        title: 'Uptime Robot - RSS (enhanced)',
        description: rss.description,
        link: rssUrl,
        item: items,
        image: 'https://uptimerobot.com/favicon.ico',
    });
};
