import type { FetchMessageObject } from 'imapflow';
import { ImapFlow } from 'imapflow';
import type { Address, Email } from 'postal-mime';
import PostalMime, { addressParser } from 'postal-mime';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
import InvalidParameterError from '@/errors/types/invalid-parameter';
import type { Route } from '@/types';
import cache from '@/utils/cache';
import logger from '@/utils/logger';
import { parseDate } from '@/utils/parse-date';

interface MailConfig {
    username: string;
    port: number | string;
    password?: string;
    host?: string;
}

const deliveryHeaders = ['delivered-to', 'x-original-to', 'envelope-to'];

function getAddresses(addresses: Address[]): string[] {
    return addresses.flatMap((address) => (address.group ? getAddresses(address.group) : [address.address.toLowerCase()]));
}

function hasRecipient(parsed: Email, recipient: string): boolean {
    const delivered = parsed.headers.filter((header) => deliveryHeaders.includes(header.key)).flatMap((header) => addressParser(header.value));
    return getAddresses([...(parsed.to || []), ...(parsed.cc || []), ...(parsed.bcc || []), ...delivered]).includes(recipient);
}

export const route: Route = {
    path: ['/imap/:email/subaddress/:subaddress/:folder{.+}?', '/imap/:email/:folder{.+}?'],
    categories: ['other'],
    example: '/mail/imap/rss@rsshub.app',
    parameters: {
        email: 'Email account',
        subaddress: 'Optional plus-address tag. For user@example.com and newsletter, select mail addressed to user+newsletter@example.com.',
        folder: 'Inbox name, `INBOX` by default',
    },
    description: 'Only support IMAP protocol, email password and other settings refer to [Route-specific Configurations](https://docs.rsshub.app/deploy/config#route-specific-configurations)',
    name: 'Inbox',
    maintainers: ['kt286'],
    handler,
};

async function handler(ctx) {
    const { email, subaddress, folder = 'INBOX' } = ctx.req.param();
    const limit = Number(ctx.req.query('limit')) || 10;
    if (subaddress && !/^[\w.-]+$/.test(subaddress)) {
        throw new InvalidParameterError('Subaddress must contain only letters, numbers, dots, underscores and hyphens.');
    }
    const at = email.lastIndexOf('@');
    const recipient = subaddress ? `${email.slice(0, at)}+${subaddress}${email.slice(at)}`.toLowerCase() : undefined;
    const mailConfig: MailConfig = {
        username: email,
        port: 993,
        ...Object.fromEntries(new URLSearchParams(config.email.config[email.replaceAll(/[.@]/g, '_')])),
    };

    if (!mailConfig.username || !mailConfig.password || !mailConfig.host || !mailConfig.port) {
        throw new ConfigNotFoundError('Email Inbox RSS is disabled due to the lack of <a href="https://docs.rsshub.app/deploy/#route-specific-configurations">relevant config</a>');
    }

    const client = new ImapFlow({
        host: mailConfig.host,
        port: Number.parseInt(String(mailConfig.port)),
        secure: true,
        auth: {
            user: mailConfig.username,
            pass: mailConfig.password,
        },
        proxy: config.proxyUri, // Note: socks5h is not supported
        logger: {
            debug: (log) => logger.debug(log.msg),
            info: (log) => logger.info(log.msg),
            warn: (log) => logger.warn(log.msg),
            error: (log) => logger.error(log?.msg),
        },
    });

    try {
        await client.connect();
    } catch (error) {
        throw new Error((error as { responseText: string }).responseText, { cause: error });
    }

    const mails: FetchMessageObject[] = [];
    let items;
    try {
        const lock = await client.getMailboxLock(folder);
        try {
            const mailbox = client.mailbox;
            if (!mailbox) {
                throw new Error(`Failed to open mailbox ${folder}`);
            }
            if (mailbox.exists) {
                const matching = recipient
                    ? await client.search({ or: [{ to: recipient }, { cc: recipient }, { bcc: recipient }, ...deliveryHeaders.map((header) => ({ header: { [header]: recipient } }))] }, { uid: true })
                    : undefined;
                const range = recipient ? (matching || []).slice(-limit).join(',') : `${Math.max(mailbox.exists - limit + 1, 1)}:*`;
                if (range) {
                    const messages = client.fetch(range, { envelope: true, source: true, uid: true }, { uid: Boolean(recipient) });
                    for await (const message of messages) {
                        mails.push(message);
                    }
                }
            }
        } finally {
            lock.release();
        }

        const parsedMails = await Promise.all(mails.map(async (item) => ({ item, parsed: await PostalMime.parse(item.source!) })));
        items = await Promise.all(
            parsedMails
                .filter(({ parsed }) => !recipient || hasRecipient(parsed, recipient))
                .map(({ item, parsed }) =>
                    cache.tryGet(`mail:${email}:${folder}:${item.envelope?.messageId || item.uid}`, () => {
                        let description = parsed.html || parsed.text?.replaceAll('\n', '<br>') || '';
                        if (parsed.attachments.length) {
                            description += `<h3>Attachments (${parsed.attachments.length})</h3>`;
                            for (const attachment of parsed.attachments) {
                                description += `<p>${attachment.filename}</p>`;
                            }
                        }
                        return Promise.resolve({
                            title: item.envelope?.subject,
                            description,
                            pubDate: item.envelope?.date ? parseDate(item.envelope.date) : undefined,
                            author: parsed.from?.name || getAddresses(parsed.from ? [parsed.from] : [])[0],
                            guid: `mail:${email}:${folder}:${item.envelope?.messageId || item.uid}`,
                        });
                    })
                )
        );
    } finally {
        await client.logout();
    }

    return {
        title: `${recipient || email}'s Inbox${folder === 'INBOX' ? '' : ` - ${folder}`}`,
        link: `https://${email.split('@', 2)[1]}`,
        item: items,
        allowEmpty: true,
    };
}
