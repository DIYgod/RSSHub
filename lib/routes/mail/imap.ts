import { ImapFlow, type MailboxObject } from 'imapflow';
import { simpleParser } from 'mailparser';

import { config } from '@/config';
import ConfigNotFoundError from '@/errors/types/config-not-found';
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

export const route: Route = {
    path: '/imap/:email/:folder{.+}?',
    categories: ['other'],
    example: '/mail/imap/rss@rsshub.app',
    parameters: {
        email: 'Email account',
        folder: 'Inbox name, `INBOX` by default',
    },
    description: 'Only support IMAP protocol, email password and other settings refer to [Route-specific Configurations](https://docs.rsshub.app/deploy/config#route-specific-configurations)',
    name: 'Inbox',
    maintainers: ['kt286'],
    handler,
};

async function handler(ctx) {
    const { email, folder = 'INBOX' } = ctx.req.param();
    const { limit = 10 } = ctx.req.query();
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

    /**
    [
        {
          // https://imapflow.com/global.html#FetchMessageObject
          seq: Number,
          uid: Number,
          envelope: {
            // https://imapflow.com/global.html#MessageEnvelopeObject
          },
          id: 'md5-like-hash-string',
          source: Buffer,
        }
      ]
    */
    const mails: any[] = [];
    const lock = await client.getMailboxLock(folder);
    try {
        const messages = client.fetch(`${Math.max((client.mailbox as MailboxObject).exists - limit + 1, 1)}:*`, { envelope: true, source: true, uid: true });
        for await (const message of messages) {
            mails.push(message);
        }
    } finally {
        lock.release();
    }

    const items = await Promise.all(
        mails.map((item) =>
            cache.tryGet(`mail:${email}:${item.envelope.messageId}`, async () => {
                const parsed = await simpleParser(item.source);

                let description = parsed.html || parsed.textAsHtml;
                if (parsed.attachments.length) {
                    description += `<h3>Attachments (${parsed.attachments.length})</h3>`;
                    for (const attachment of parsed.attachments) {
                        description += `<p>${attachment.filename}</p>`;
                    }
                }

                return {
                    title: item.envelope.subject,
                    description,
                    pubDate: parseDate(item.envelope.date),
                    author: parsed.from!.text,
                    guid: `mail:${email}:${item.envelope.messageId}`,
                };
            })
        )
    );

    await client.logout();

    return {
        title: `${email}'s Inbox${folder === 'INBOX' ? '' : ` - ${folder}`}`,
        link: `https://${email.split('@', 2)[1]}`,
        item: items,
        allowEmpty: true,
    };
}
