import Link from "@docusaurus/Link";

export default function InstanceList(): JSX.Element {
  const instances = [{
    url: 'https://rsshub.rssforever.com',
    location: '🇦🇪',
    maintainer: 'Stille',
    maintainerUrl: 'https://www.ioiox.com',
  }, {
    url: 'https://rsshub.feeded.xyz',
    location: '🇺🇸',
    maintainer: '胜之不易',
    maintainerUrl: 'https://uneasy.win',
  }, {
    url: 'https://hub.slarker.me',
    location: '🇺🇸',
    maintainer: 'Slarker',
    maintainerUrl: 'https://slarker.me',
  }, {
    url: 'https://rsshub.liumingye.cn',
    location: '🇭🇰',
    maintainer: '刘明野',
    maintainerUrl: 'https://www.liumingye.cn',
  }, {
    url: 'https://rsshub-instance.zeabur.app',
    location: '🇺🇸',
    maintainer: 'Zeabur',
    maintainerUrl: 'https://zeabur.com',
  }, {
    url: 'https://rss.fatpandac.com',
    location: '🇺🇸',
    maintainer: 'Fatpandac',
    maintainerUrl: 'https://fatpandac.com',
  }, {
    url: 'https://rsshub.pseudoyu.com',
    location: '🇺🇸',
    maintainer: 'pseudoyu',
    maintainerUrl: 'https://www.pseudoyu.com',
  }, {
    url: 'https://rsshub.friesport.ac.cn',
    location: '🇺🇸',
    maintainer: '思维悦动',
    maintainerUrl: 'https://friesport.ac.cn',
  }, {
    url: 'https://rsshub.atgw.io',
    location: '🇺🇸',
    maintainer: 'limfoo',
    maintainerUrl: 'https://blog.limfoo.io',
  }]

  return (
    <table>
      <thead>
        <tr>
          <th>URL</th>
          <th>Location</th>
          <th>Maintainer</th>
          <th>Online</th>
        </tr>
      </thead>
      <tbody>
        {instances.map((instance) => (
          <tr key={instance.url}>
            <td>
              <Link to={instance.url}>{new URL(instance.url).host}</Link>
            </td>
            <td>{instance.location}</td>
            <td>
              {instance.maintainer ? (
                <Link to={instance.maintainerUrl}>{instance.maintainer}</Link>
              ) : 'Anonymous'}
            </td>
            <td>
              <img loading="lazy" src={`https://img.shields.io/website.svg?label=&url=${encodeURIComponent(`${instance.url}/test/cache`)}`} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
