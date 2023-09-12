const { ImapFlow } = require('imapflow');
const config = require('@/config').value;
const { simpleParser } = require('mailparser');
const logger = require('@/utils/logger');
const { parseDate } = require('@/utils/parse-date');

module.exports = async (ctx) => {
    const { email } = ctx.params;
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
    const items = [];
    const lock = await client.getMailboxLock('INBOX');
    try {
        for await (const message of client.fetch(`${Math.max(client.mailbox.exists - limit + 1, 1)}:*`, { envelope: true, source: true, uid: true })) {
            const parsed = await simpleParser(message.source);

            let description = parsed.html || parsed.textAsHtml;
            if (parsed.attachments.length) {
                description += `<h3>Att. (${parsed.attachments.length})</h3>`;
                parsed.attachments.forEach((attachment) => {
                    description += `<p>${attachment.filename}</p>`;
                });
            }

            items.push({
                title: message.envelope.subject,
                description,
                pubDate: parseDate(message.envelope.date),
                author: parsed.from.text,
                guid: `mail:${email}:${message.envelope.messageId}`,
            });
        }
    } finally {
        lock.release();
    }
    await client.logout();

    ctx.state.data = {
        title: `${email}'s Inbox`,
        link: `https://${email.split('@')[1]}`,
        item: items,
        allowEmpty: true,
    };
};
