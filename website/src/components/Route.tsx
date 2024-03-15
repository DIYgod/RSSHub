import MarkdownIt from 'markdown-it';
import Badge from './Badge';
import Translate from '@docusaurus/Translate';
import Link from '@docusaurus/Link';
import type { Route } from '../../../lib/types';

export default function Route({
  namespace,
  data,
  children = null,
}: {
  namespace: string,
  data: Route;
  children?: JSX.Element | JSX.Element[];
}): JSX.Element {
    const demoUrl = data.example ? ('https://rsshub.app' + data.example) : null;
    const paramMatch = data.path.match?.(/(?<=:).*?(?=\/|$)/g);

    const renderMarkdown = (item, inline = true) => {
        const md = new MarkdownIt({
            html: true,
        });
        return inline ? md.renderInline(item) : md.render(item);
    };

    return (
        <div className='routeBlock' id={namespace + JSON.stringify(data.path)}>
            <p className="badges">
                {data.features?.antiCrawler && (
                    <Link to="/faq">
                        <Badge type="caution"><Translate id="badge.anticrawler" /></Badge>
                    </Link>
                )}
                {data.features?.supportBT && <Badge type="tip"><Translate id="badge.supportBT" /></Badge>}
                {data.features?.supportPodcast && <Badge type="tip"><Translate id="badge.supportPodcast" /></Badge>}
                {data.features?.supportScihub && <Badge type="tip"><Translate id="badge.supportSciHub" /></Badge>}
                {data.features?.requirePuppeteer && <Badge type="warning"><Translate id="badge.puppeteer" /></Badge>}
                {data.features?.requireConfig && (
                    <Link to="/install/config#route-specific-configurations">
                        <Badge type="warning"><Translate id="badge.configRequired" /></Badge>
                    </Link>
                )}
                {data.radar && (
                    <Link to="/usage#radar">
                        <Badge type="tip"><Translate id="badge.radar" /></Badge>
                    </Link>
                )}
            </p>
            <p className="author">
                <Translate id="route.author" />
                {data.maintainers?.map((uid) => (
                    <Link to={`https://github.com/${uid}`} key={uid}>
                        @{uid}{' '}
                    </Link>
                ))}
            </p>
            {demoUrl && (
                <p className="example">
                <span><Translate id="route.example" /></span>
                <Link to={demoUrl}>
                    {demoUrl}
                </Link>
                <img loading="lazy" src={`https://img.shields.io/website.svg?label=&url=${encodeURIComponent(demoUrl)}&cacheSeconds=7200`} />
            </p>
            )}
            <p className="path">
                <Translate id="route.path" /><code>/{namespace + data.path}</code>
            </p>
            {paramMatch && (
                <div>
                    <p><Translate id="route.parameter" /></p>
                    <ul>
                        {paramMatch.map((item, index) => (
                            <li className="params" key={index}>
                                <code>{item.replace(/:|\?|\+|\*/g, '')}</code><Translate id="route.comma" />
                                {{
                                    '?': <Translate id="route.parameter.optional" />,
                                    '*': <Translate id="route.parameter.zeroOrMore" />,
                                    '+': <Translate id="route.parameter.oneOrMore" />,
                                }[item[item.length - 1]] || <Translate id="route.parameter.required" /> }
                                <Translate id="route.dash" />
                                <span dangerouslySetInnerHTML={{ __html: renderMarkdown(data.parameters?.[item.replace(/:|\?|\+|\*/g, '')] || '') }}></span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {data.features?.requireConfig && (
                <div>
                    <p><Translate id="route.config" /></p>
                    <ul>
                        {data.features.requireConfig.map?.((item, index) => (
                            <li className="params" key={index}>
                                <code>{item.name}</code><Translate id="route.comma" />
                                {item.optional ? <Translate id="route.parameter.optional" /> : <Translate id="route.parameter.required" />}
                                <Translate id="route.dash" />
                                <span dangerouslySetInnerHTML={{ __html: renderMarkdown(item.description) }}></span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            <p className="path">
                <Translate id="route.sourcecode" />
                <code>
                    <a target='_blank' href={`https://github.com/DIYgod/RSSHub/blob/master/lib/routes/${namespace}/${data.location}`} >{`/${namespace}/${data.location}`}</a>
                </code>
            </p>
            {children}
        </div>
    );
}
