// RSSHub as a magpie plugin (https://github.com/yetone/magpie), the module package.json's
// exports["./server"] names. magpie loads it in its plugin host (Bun), where it:
//
// - runs a local RSSHub server as a child process, on 127.0.0.1:1200 by default. It is a child
//   of its own, never in the host, since RSSHub patches globals such as fetch that the host's
//   other plugins use;
// - gives every agent three tools, through magpie's MCP server of plugin tools: search_routes,
//   lookup_url and get_feed (rsshub_search_routes and so on, as magpie names them);
// - is a page in magpie's window (package.json's magpie.page), which shows the server.
//
// Its options (Plugins › Installed › Options in magpie), all optional:
//   port       the server's port, 1200 by default
//   publicUrl  the server's address as RSS readers reach it, for the feed URLs the tools give
//              (http://127.0.0.1:<port> by default)
//   env        RSSHub's environment variables (https://docs.rsshub.app/deploy/config), such as
//              {"GITHUB_ACCESS_TOKEN": "…"}; they can also go in a `.env` file in the `rsshub`
//              folder of magpie's config folder. LISTEN_INADDR_ANY=1 opens the server to the network.

import { createHash } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';

import { parse as parseHost } from 'tldts';
import { z } from 'zod';

import type { RadarDomain, RadarItem } from '@/types';

import type { Catalog } from './catalog';
import { createCatalog, describe } from './catalog';
import type { JsonFeed } from './feed';
import { formatFeed } from './feed';
import { startInstance } from './instance';
import { matchRadar, subdomainsOf } from './radar';

interface PluginInput {
    directory?: string;
    worktree?: string;
}

interface PluginOptions {
    port?: number | string;
    publicUrl?: string;
    env?: Record<string, unknown>;
}

interface ToolContext {
    abort?: AbortSignal;
}

const DEFAULT_PORT = 1200;
// magpie gives a tool 55 seconds
const TOOL_TIME = 50000;

const portOf = (value: unknown) => {
    const port = Number(value);
    return Number.isSafeInteger(port) && port > 0 && port < 65536 ? port : DEFAULT_PORT;
};

const stringsOf = (env: PluginOptions['env']) => {
    const out: Record<string, string> = {};
    const entries = Object.entries(env ?? {});
    for (const [key, value] of entries) {
        if (value !== undefined && value !== null) {
            out[key] = String(value);
        }
    }
    return out;
};

const signalOf = (ctx?: ToolContext) => (ctx?.abort ? AbortSignal.any([ctx.abort, AbortSignal.timeout(TOOL_TIME)]) : AbortSignal.timeout(TOOL_TIME));

const errorText = (error: unknown) => (error instanceof Error ? error.message : String(error));

// A tool's failure is its answer, for the agent to read
const guarded =
    <A>(fn: (args: A, ctx?: ToolContext) => Promise<string>) =>
    async (args: A, ctx?: ToolContext) => {
        try {
            return await fn(args, ctx);
        } catch (error) {
            return `RSSHub tool failed: ${errorText(error)}`;
        }
    };

const RSSHubPlugin = (input: PluginInput, options?: PluginOptions) => {
    const port = portOf(options?.port);
    const configDir = input?.directory || input?.worktree || path.join(os.homedir(), '.config', 'magpie');
    const instance = startInstance({
        serverFile: path.join(import.meta.dirname, 'magpie-server.mjs'),
        dataDir: path.join(configDir, 'rsshub'),
        port,
        env: stringsOf(options?.env),
        // magpie logs what its plugin host prints, as `plugin: …`
        log: (line) => process.stderr.write(`[rsshub] ${line}\n`),
    });
    const publicUrl = (options?.publicUrl?.trim() || `127.0.0.1:${port}`).replace(/^(?!https?:\/\/)/i, 'http://').replace(/\/+$/, '');

    // A feed's address for an RSS reader. With ACCESS_KEY set, it carries the feed's own code
    // (md5 of its path and the key, as RSSHub checks it) rather than the key.
    const feedUrlOf = (pathAndQuery: string) => {
        const target = new URL(pathAndQuery, 'http://rsshub');
        const feedUrl = new URL(`${publicUrl}${target.pathname}${target.search}`);
        if (instance.env.ACCESS_KEY) {
            feedUrl.searchParams.set(
                'code',
                createHash('md5')
                    .update(target.pathname + instance.env.ACCESS_KEY)
                    .digest('hex')
            );
        }
        return feedUrl.href;
    };

    const get = async (pathname: string, signal: AbortSignal) => {
        await instance.ready(signal);
        return fetch(instance.url(pathname), { signal });
    };

    const loadCatalog = async (signal: AbortSignal) => {
        const response = await get('/api/namespace', signal);
        if (!response.ok) {
            throw new Error(`RSSHub answered ${response.status} for its routes`);
        }
        return createCatalog(await response.json());
    };
    let catalog: Catalog | undefined;
    let loading: Promise<Catalog> | undefined;
    const catalogOf = async (signal: AbortSignal) => {
        if (catalog) {
            return catalog;
        }
        loading ??= loadCatalog(signal);
        try {
            catalog = await loading;
            return catalog;
        } finally {
            // one that failed is asked again next time
            loading = undefined;
        }
    };

    const radarRules = new Map<string, RadarDomain | null>();
    const rulesOf = async (domain: string, signal: AbortSignal) => {
        if (!radarRules.has(domain)) {
            const response = await get(`/api/radar/rules/${encodeURIComponent(domain)}`, signal);
            const text = response.ok ? await response.text() : '';
            radarRules.set(domain, text && text !== 'null' ? (JSON.parse(text) as RadarDomain) : null);
        }
        return radarRules.get(domain);
    };

    const searchRoutes = async ({ query, limit }: { query: string; limit?: number }, ctx?: ToolContext) => {
        const found = await catalogOf(signalOf(ctx));
        const entries = found.search(query, limit ?? 8);
        if (entries.length === 0) {
            return `No RSSHub route matches "${query}" (of ${found.entries.length} routes). Try the site's name or domain in English (bilibili, youtube.com), fewer words, or lookup_url with a page of the site.`;
        }
        return [
            `RSSHub routes for "${query}":`,
            '',
            entries.map((entry, i) => describe(entry, i + 1)).join('\n\n'),
            '',
            'Read one with get_feed: its path with the parameters filled in (an optional one may be left out), such as its example.',
        ].join('\n');
    };

    const lookupUrl = async ({ url }: { url: string }, ctx?: ToolContext) => {
        let page: URL;
        try {
            page = new URL(/^[a-z][\d+.a-z-]*:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`);
        } catch {
            return `"${url}" isn't a URL.`;
        }
        const host = parseHost(page.hostname);
        if (!host.domain) {
            return `RSSHub has no rules for ${page.hostname}.`;
        }
        const domain = await rulesOf(host.domain, signalOf(ctx));
        if (!domain) {
            return `RSSHub Radar has no rules for ${host.domain}. RSSHub may still have routes for the site: try search_routes with its name.`;
        }
        const rules = subdomainsOf(host.subdomain || '.').flatMap((subdomain) => (domain[subdomain] as RadarItem[] | undefined) ?? []);
        const matches = matchRadar(page, rules);
        if (matches.length === 0) {
            const others = Object.entries(domain)
                .filter(([subdomain]) => subdomain !== '_name')
                .flatMap(([subdomain, items]) => (items as RadarItem[]).map((item) => `- ${item.title}: ${subdomain === '.' ? '' : `${subdomain}.`}${host.domain}${item.source[0]} → ${item.target}`));
            return [`No RSSHub feed matches ${page.href}. ${domain._name}'s feeds are for these pages:`, ...others.slice(0, 30), others.length > 30 ? `… and ${others.length - 30} more; search_routes finds them by name.` : '']
                .join('\n')
                .trim();
        }
        return [
            `RSSHub feeds for ${page.href} (${domain._name}):`,
            '',
            ...matches.map((match, i) => {
                const lines = [`${i + 1}. ${match.title}: ${match.path}`];
                if (match.missing.length) {
                    lines.push(`   needs ${match.missing.map((name) => `:${name}`).join(', ')}, which the URL doesn't give: see search_routes`);
                } else {
                    lines.push(`   feed URL: ${feedUrlOf(match.path)}`);
                }
                return lines.join('\n');
            }),
            '',
            'Read one with get_feed.',
        ].join('\n');
    };

    const getFeed = async ({ path: route, limit, contentLength }: { path: string; limit?: number; contentLength?: number }, ctx?: ToolContext) => {
        let wanted = route.trim();
        if (/^https?:\/\//i.test(wanted)) {
            const asked = new URL(wanted);
            wanted = asked.pathname + asked.search;
        }
        if (!wanted.startsWith('/')) {
            wanted = `/${wanted}`;
        }
        const target = new URL(wanted, instance.origin);
        const shown = feedUrlOf(target.pathname + target.search);
        target.searchParams.set('format', 'json');
        target.searchParams.set('limit', String(limit ?? 10));
        const response = await get(target.pathname + target.search, signalOf(ctx));
        const text = await response.text();
        let data: (JsonFeed & { error?: { message?: string } }) | undefined;
        try {
            data = JSON.parse(text);
        } catch {
            data = undefined;
        }
        if (!response.ok || !data || data.error) {
            if (response.status === 404) {
                return `RSSHub has no route ${target.pathname}${data?.error?.message ? ` (${data.error.message})` : ''}. Find the right path with search_routes or lookup_url.`;
            }
            return `RSSHub couldn't make the feed ${target.pathname} (${response.status}): ${data?.error?.message || text.slice(0, 500) || 'no reason given'}`;
        }
        return formatFeed(data, shown, contentLength ?? 500);
    };

    return {
        tool: {
            search_routes: {
                description:
                    'Search the routes of RSSHub, a feed generator running on this computer that makes feeds of thousands of websites: social media (X, YouTube, Bilibili, Weibo, Telegram, Instagram…), news, forums, blogs, GitHub, podcasts and more. Give the site name, its domain or a topic as a few keywords. Answers each matching route with its path, an example and its parameters; read a route with get_feed.',
                args: {
                    query: z.string().describe('Keywords: a site name or domain (github, youtube.com, 少数派) and what to follow (issues, user videos)'),
                    limit: z.number().int().min(1).max(30).optional().describe('How many routes to answer, 8 by default'),
                },
                execute: guarded(searchRoutes),
            },
            lookup_url: {
                description:
                    "Find RSSHub feeds for a web page from its URL, such as a profile, a channel, a repository or a forum board, with RSSHub Radar's rules. Answers each feed's path with the URL's parts filled in; read one with get_feed.",
                args: {
                    url: z.string().describe('The web page URL, e.g. https://github.com/DIYgod/RSSHub'),
                },
                execute: guarded(lookupUrl),
            },
            get_feed: {
                description:
                    "Read a feed from RSSHub on this computer: the latest items (title, link, date, author, text) of an RSSHub route such as /github/issue/DIYgod/RSSHub or /hackernews/best. Get a route's path from search_routes or lookup_url. The answer gives the feed's URL too, for an RSS reader to subscribe to.",
                args: {
                    path: z.string().describe("The route's path with its parameters filled in, e.g. /github/issue/DIYgod/RSSHub; RSSHub's common query parameters (filter, filterout, …) may follow"),
                    limit: z.number().int().min(1).max(50).optional().describe('How many items, 10 by default'),
                    contentLength: z.number().int().min(0).max(5000).optional().describe("How many characters of each item's text, 500 by default; 0 for none"),
                },
                execute: guarded(getFeed),
            },
        },
    };
};

// magpie calls every function the module exports as a plugin: the plugin alone, in OpenCode's v1 shape
export default { id: 'rsshub', server: RSSHubPlugin };
