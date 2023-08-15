import React from 'react';
import MarkdownIt from 'markdown-it';
import Badge from './Badge';

export default function Route({
  author = 'DIYgod',
  path = '',
  example = '',
  paramsDesc = '无',
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
                {supportBT && <Badge text="支持 BT" type="tip" />}
                {supportPodcast && <Badge text="支持播客" type="tip" />}
                {supportScihub && <Badge text="支持 Sci-Hub" type="tip" />}
                {puppeteer && <Badge text="依赖 Puppeteer" type="warn" />}
                {anticrawler && (
                    <a target="_blank" href="/faq.html">
                        <Badge text="反爬严格" type="warn" />
                    </a>
                )}
                {selfhost && (
                    <a target="_blank" href="/install/">
                        <Badge text="仅支持自建" type="warn" />
                    </a>
                )}
                {radar && (
                    <a target="_blank" href="https://github.com/DIYgod/RSSHub-Radar">
                        <Badge text="支持浏览器扩展" type="tip" />
                    </a>
                )}
                {rssbud && (
                    <a target="_blank" href="https://github.com/Cay-Zhang/RSSBud">
                        <Badge text="支持 RSSBud" type="tip" />
                    </a>
                )}
            </p>
            <p className="author">
                作者:{' '}
                {author.split(' ').map((uid) => (
                    <a href={`https://github.com/${uid}`} target="_blank" key={uid}>
                        {' '}
                        @ {uid}{' '}
                    </a>
                ))}
            </p>
            <p className="example">
                <span>举例:</span>{' '}
                <a href={demoUrl} target="_blank">
                    {demoUrl}
                </a>
            </p>
            <p className="path">
                路由: <code>{path}</code>
            </p>
            {paramMatch ? (
                <div>
                    <p>参数:</p>
                    <ul>
                        {paramMatch.map((item, index) => (
                            <li className="params" key={index}>
                                <code>{item.replace(/:|\?|\+|\*/g, '')}</code>,
                                {{
                                    '?': '可选',
                                    '*': '零个或多个',
                                    '+': '单个或多个',
                                }[item[item.length - 1]] || '必选'}
                                -<span dangerouslySetInnerHTML={{ __html: renderMarkdown(paramsDesc[index]) }}></span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>参数: 无</p>
            )}
            {children}
        </div>
    );
}
