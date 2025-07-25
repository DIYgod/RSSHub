import { SingleASTNode } from '@khanacademy/simple-markdown';
import { APIChannelMention, Snowflake, APIUser, APIRole } from 'discord-api-types/v10';
import { baseUrl } from './discord-api';
import { parse as parseMarkdown } from 'discord-markdown-parser';
import logger from '@/utils/logger';

type NodeTypes =
    | 'blockQuote'
    | 'codeBlock'
    | 'newline'
    | 'escape'
    | 'autolink'
    | 'url'
    | 'em'
    | 'strong'
    | 'underline'
    | 'strikethrough'
    | 'inlineCode'
    | 'text'
    | 'emoticon'
    | 'br'
    | 'spoiler'
    | 'heading'
    | 'subtext'
    | 'user'
    | 'channel'
    | 'role'
    | 'emoji'
    | 'everyone'
    | 'here'
    | 'twemoji'
    | 'timestamp'
    | 'slashCommand'
    | 'guildNavigation'
    | 'link';

type NodeFormatter = { [_ in NodeTypes]: (node: SingleASTNode) => string };

type TimeFormats = 'R' | 'F' | 'f' | 'D' | 'd' | 'T' | 't';
type TimeFormatter = { [_ in TimeFormats]: (time: Date, locale: Intl.Locale | undefined) => string };

type DateParts = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';

// Round towards zero
function getTimeDiff(t1: Date, t2: Date, unit: DateParts): number {
    const ms1 = t1.getTime();
    const ms2 = t2.getTime();
    if (ms1 === ms2) {
        return 0;
    } else if (ms1 < ms2) {
        return -getTimeDiff(t2, t1, unit);
    }

    switch (unit) {
        case 'year': {
            let ret = t1.getFullYear() - t2.getFullYear();
            while (new Date(ms2).setFullYear(t2.getFullYear() + ret) > ms1) {
                ret--;
            }
            return ret;
        }
        case 'month': {
            const yearDiff = getTimeDiff(t1, t2, 'year');
            let ret = 0;
            while (new Date(ms2).setFullYear(t2.getFullYear() + yearDiff, t2.getMonth() + ret + 1) <= ms1) {
                ret++;
            }
            return yearDiff * 12 + ret;
        }
        case 'day':
            return Math.floor((ms1 - ms2) / (24 * 60 * 60 * 1000));
        case 'hour':
            return Math.floor((ms1 - ms2) / (60 * 60 * 1000));
        case 'minute':
            return Math.floor((ms1 - ms2) / (60 * 1000));
        case 'second':
            return Math.floor((ms1 - ms2) / 1000);
        default:
            throw new RangeError(`Invalid Time Unit: ${unit}`);
    }
}

function getTimeDiffInLargestUnit(t1: Date, t2: Date): { diff: number; unit: DateParts } {
    const units: DateParts[] = ['year', 'month', 'day', 'hour', 'minute', 'second'];
    return (
        units
            .map((unit) => ({
                diff: getTimeDiff(t1, t2, unit),
                unit,
            }))
            .find((x) => x.diff !== 0) ?? { diff: 0, unit: 'second' }
    );
}

export function getLocaleFromHeader(header: string): Intl.Locale | undefined {
    return header
        .split(',')
        .map((part) => {
            const [l, q] = part.split(';', 2);

            let lang: Intl.Locale | undefined;
            // '*' or any bad string become system default (undefined)
            try {
                lang = new Intl.Locale(l.trim());
            } catch (error) {
                if (!(error instanceof RangeError)) {
                    throw error;
                }
            }

            let weight = q === undefined ? 1 : Number.parseFloat(q.trim());
            if (Number.isNaN(weight)) {
                weight = 1;
            }

            return { language: lang, weight };
        })
        .reduce((prev, curr) => (curr.weight > prev.weight ? curr : prev)).language;
}

export class MessageFormatter {
    formatter: NodeFormatter = {
        text: (node) => node.content,
        br: () => '<br>',
        newline: () => '\n',
        escape: (node) => node.content,

        twemoji: (node) => node.content,
        emoji: (node) => `<img src="https://cdn.discordapp.com/emojis/${node.id}" alt="${node.name}">`,
        emoticon: (node) => ` ${node.content} `,

        heading: (node) => `<h${node.level}>${this.parseAST(node.content)}</h${node.level}>`,
        strong: (node) => `<strong>${this.parseAST(node.content)}</strong>`,
        em: (node) => `<em>${this.parseAST(node.content)}</em>`,
        subtext: (node) => `<small>${node.small}</small>`,
        strikethrough: (node) => `<s>${this.parseAST(node.content)}</s>`,
        underline: (node) => `<u>${this.parseAST(node.content)}</u>`,
        blockQuote: (node) => `<blockquote>${this.parseAST(node.content)}</blockquote>`,
        codeBlock: (node) => `<code>${node.content}</code>`,
        inlineCode: (node) => `<code>${node.content}</code>`,
        spoiler: (node) => {
            const parsed = this.parseAST(node.content);
            if (parsed.match(/<.*>/) === null) {
                // no HTML tag, then we can use hover text for spoiler
                return `<span title="${parsed}">${'█'.repeat(parsed.length)}</span>`;
            }
            return `<details><summary>Spoiler</summary>${this.parseAST(node.content)}</details>`;
        },
        slashCommand: (node) => `<code>/${node.fullName ?? 'UNKNOWN_COMMAND'}</code>`,

        url: (node) => `<a href="${node.target}">${this.parseAST(node.content)}</a>`,
        autolink: (node) => `<a href="${node.target}">${this.parseAST(node.content)}</a>`,
        link: (node) => (node.title === undefined ? `<a href="${node.target}">${this.parseAST(node.content ?? node.target)}</a>` : `<a href="${node.target}" title="${node.title}">${this.parse(node.content ?? node.target)}</a>`),

        user: (node) => {
            const user = this.mentionUserMap.get(node.id);
            return `@${user?.global_name ?? user?.username ?? 'User ' + node.id} `;
        },
        role: (node) => {
            const role = this.mentionRoleMap.get(node.id);
            return `@${role?.name ?? 'Role ' + node.id} `;
        },
        channel: (node) => {
            const channel = this.mentionChannelMap.get(node.id);
            return channel === undefined ? `<a href=""># Channel ${node.id}</a>` : `<a href="${baseUrl}/channels/${channel.guild_id}/${channel.id}}"># ${channel.name}</a>`;
        },
        everyone: () => '@everyone ',
        here: () => '@here ',
        guildNavigation: (node) => `<a href="${baseUrl}/channels/${node.id}"># Guild ${node.id}</a>`,

        // https://discord.com/developers/docs/reference#message-formatting-timestamp-styles
        timestamp: (node) => {
            const formatters: TimeFormatter = {
                R: (time, locale) => {
                    const { diff, unit } = getTimeDiffInLargestUnit(new Date(), time);
                    return new Intl.RelativeTimeFormat(locale, {
                        localeMatcher: 'best fit',
                        numeric: 'always',
                        style: 'long',
                    }).format(diff, unit);
                },
                F: (time, locale) =>
                    time.toLocaleTimeString(locale, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                f: (time, locale) =>
                    time.toLocaleTimeString(locale, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                D: (time, locale) =>
                    time.toLocaleTimeString(locale, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    }),
                d: (time, locale) =>
                    time.toLocaleTimeString(locale, {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    }),
                T: (time, locale) =>
                    time.toLocaleTimeString(locale, {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    }),
                t: (time, locale) =>
                    time.toLocaleTimeString(locale, {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
            };
            const time = new Date(Number.parseInt(node.timestamp) * 1000);
            const formatter = formatters[node.format ?? 'f'];
            return formatter(time, this.locale);
        },
    };

    constructor(
        private mentionUserMap: Map<Snowflake, APIUser>,
        private mentionRoleMap: Map<Snowflake, APIRole>,
        private mentionChannelMap: Map<Snowflake, APIChannelMention>,
        private locale?: Intl.Locale
    ) {}

    private parseAST(ast: SingleASTNode[]): string {
        const parts = ast.map((node) => {
            if (this.formatter[node.type] === undefined) {
                logger.error(`Unable to parse Markdown AST node: ${JSON.stringify(node)}: Unrecognized Type`);
                return '<em>markdown node parsing failure</em>';
            }
            try {
                return this.formatter[node.type].call(this, node);
            } catch (error) {
                logger.error(`Failed to parse Markdown AST node: ${JSON.stringify(node)}: ${error}`);
                return '<em>markdown node parsing failure</em>';
            }
        });

        return parts.join('');
    }

    public parse(message: string): string {
        const ast = parseMarkdown(message, 'extended');
        return this.parseAST(ast);
    }
}
