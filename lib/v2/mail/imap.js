const { ImapFlow } = require('imapflow');
const config = require('@/config').value;
const { simpleParser } = require('mailparser');
const logger = require('@/utils/logger');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { email, folder = 'INBOX' } = ctx.params;
    const { limit = 10 } = ctx.query;
    const mailConfig = {
        username: email,
        port: 993,
        ...Object.fromEntries(new URLSearchParams(config.email.config[email.replace(/[@.]/g, '_')])),
    };

    if (!mailConfig.username || !mailConfig.password || !mailConfig.host || !mailConfig.port) {
        throw Error('Email Inbox RSS is disabled due to the lack of <a href="https://docs.rsshub.app/install#route-specific-configurations">relevant config</a>');
    }

    const client = new ImapFlow({
        host: mailConfig.host,
        port: parseInt(mailConfig.port),
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
    } catch (e) {
        throw Error(e.responseText);
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
    const mails = [];
    const lock = await client.getMailboxLock(folder);
    try {
        for await (const message of client.fetch(`${Math.max(client.mailbox.exists - limit + 1, 1)}:*`, { envelope: true, source: true, uid: true })) {
            mails.push(message);
        }
    } finally {
        lock.release();
    }

    const items = await Promise.all(
        mails.map((item) =>
            ctx.cache.tryGet(`mail:${email}:${item.envelope.messageId}`, async () => {
                const parsed = await simpleParser(item.source);

                let description = parsed.html || parsed.textAsHtml;
                if (parsed.attachments.length) {
                    description += `<h3>Attachments (${parsed.attachments.length})</h3>`;
                    parsed.attachments.forEach((attachment) => {
                        description += `<p>${attachment.filename}</p>`;
                    });
                }

                return {
                    title: item.envelope.subject,
                    description,
                    pubDate: parseDate(item.envelope.date),
                    author: parsed.from.text,
                    guid: `mail:${email}:${item.envelope.messageId}`,
                };
            })
        )
    );

    await client.logout();

    ctx.state.data = {
        title: `${email}'s Inbox${folder !== 'INBOX' ? ` - ${folder}` : ''}`,
        link: `https://${email.split('@')[1]}`,
        item: items,
        allowEmpty: true,
    };
};
