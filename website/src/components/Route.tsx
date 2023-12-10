import MarkdownIt from 'markdown-it';
import Badge from './Badge';
import Translate from '@docusaurus/Translate';
import Link from '@docusaurus/Link';

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
  configRequired = null,
  puppeteer = null,
  notOperational = null,
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
  configRequired?: boolean;
  puppeteer?: boolean;
  notOperational?: boolean;
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
        <div className={`routeBlock ${notOperational ? "notOperational" : ""}`} id={path}>
            <p className="badges">
                {notOperational && (
                    <Link to={`https://github.com/search?q=${encodeURIComponent('repo:DIYgod/RSSHub')}+${encodeURIComponent(`"${path}"`)}&type=issues`}>
                        <Badge type="caution"><Translate id="badge.notOperational" /></Badge>
                    </Link>
                )}
                {anticrawler && (
                    <Link to="/faq">
                        <Badge type="caution"><Translate id="badge.anticrawler" /></Badge>
                    </Link>
                )}
                {supportBT && <Badge type="tip"><Translate id="badge.supportBT" /></Badge>}
                {supportPodcast && <Badge type="tip"><Translate id="badge.supportPodcast" /></Badge>}
                {supportScihub && <Badge type="tip"><Translate id="badge.supportSciHub" /></Badge>}
                {puppeteer && <Badge type="warning"><Translate id="badge.puppeteer" /></Badge>}
                {configRequired && (
                    <Link to="/install/config#route-specific-configurations">
                        <Badge type="warning"><Translate id="badge.configRequired" /></Badge>
                    </Link>
                )}
                {radar && (
                    <Link to="/usage#radar">
                        <Badge type="tip"><Translate id="badge.radar" /></Badge>
                    </Link>
                )}
            </p>
            <p className="author">
                <Translate id="route.author" />
                {author.split(' ').map((uid) => (
                    <Link to={`https://github.com/${uid}`} key={uid}>
                        @{uid}{' '}
                    </Link>
                ))}
            </p>
            <p className="example">
                <span><Translate id="route.example" /></span>
                <Link to={demoUrl}>
                    {demoUrl}
                </Link>
                <img loading="lazy" src={`https://img.shields.io/website.svg?label=&url=${encodeURIComponent(demoUrl)}&cacheSeconds=7200`} />
            </p>
            <p className="path">
                <Translate id="route.path" /><code>{path}</code>
            </p>
            {paramMatch ? (
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
                                <Translate id="route.dash" /><span dangerouslySetInnerHTML={{ __html: renderMarkdown(paramsDesc[index]) }}></span>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p><Translate id="route.parameter.na" /></p>
            )}
            {children}
        </div>
    );
}
