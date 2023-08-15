import React from 'react';
import MarkdownIt from 'markdown-it';
import Badge from './Badge';

export default function Route({
  author = 'DIYgod',
  path = '',
  example = '',
  paramsDesc = 'N/A',
  anticrawler = null,
  supportBT = null,
  supportPodcast = null,
  supportScihub = null,
  radar = null,
  rssbud = null,
  selfhost = null,
  puppeteer = null,
  children = null,
}: {
  author?: string;
  path: string;
  example?: string;
  paramsDesc?: string;
  anticrawler?: boolean;
  supportBT?: boolean;
  supportPodcast?: boolean;
  supportScihub?: boolean;
  radar?: boolean;
  rssbud?: boolean;
  selfhost?: boolean;
  puppeteer?: boolean;
  children?: JSX.Element | JSX.Element[];
}): JSX.Element {
    const demoUrl = 'https://rsshub.app' + example;
    const paramMatch = path.match(/(?<=:).*?(?=\/|$)/g);

    const renderMarkdown = (item, inline = true) => {
        const md = new MarkdownIt({
            html: true,
        });
        return inline ? md.renderInline(item) : md.render(item);
    };

    return (
        <div className="routeBlock" id={path}>
            <p className="badges">
                {supportBT && <Badge text="Support BT" type="tip" />}
                {supportPodcast && <Badge text="Support Podcast" type="tip" />}
                {supportScihub && <Badge text="Support Sci-Hub" type="tip" />}
                {puppeteer && <Badge text="Rely on Puppeteer" type="warn" />}
                {anticrawler && (
                    <a target="_blank" href="/faq.html">
                        <Badge text="Strict anti-crawler policy" type="warn" />
                    </a>
                )}
                {selfhost && (
                    <a target="_blank" href="/install/">
                        <Badge text="Self-host only" type="warn" />
                    </a>
                )}
                {radar && (
                    <a target="_blank" href="https://github.com/DIYgod/RSSHub-Radar">
                        <Badge text="Support browser extension" type="tip" />
                    </a>
                )}
                {rssbud && (
                    <a target="_blank" href="https://github.com/Cay-Zhang/RSSBud">
                        <Badge text="Support RSSBud" type="tip" />
                    </a>
                )}
            </p>
            <p className="author">
                Author:{' '}
                {author.split(' ').map((uid) => (
                    <a href={`https://github.com/${uid}`} target="_blank" key={uid}>
                        {' '}
                        @ {uid}{' '}
                    </a>
                ))}
            </p>
            <p className="example">
                <span>Example:</span>{' '}
                <a href={demoUrl} target="_blank">
                    {demoUrl}
                </a>
            </p>
            <p className="path">
                Route: <code>{path}</code>
            </p>
            {paramMatch ? (
                <div>
                    <p>Parameters:</p>
                    <ul>
                        {paramMatch.map((item, index) => (
                            <li className="params" key={index}>
                                <code>{item.replace(/:|\?|\+|\*/g, '')}</code>,
                                {{
                                    '?': 'optional',
                                    '*': 'zero or more',
                                    '+': 'one or more',
                                }[item[item.length - 1]] || 'required'}
                                -<span dangerouslySetInnerHTML={{ __html: renderMarkdown(paramsDesc[index]) }}></span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>Parameters: N/A</p>
            )}
            {children}
        </div>
    );
}
