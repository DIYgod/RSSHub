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
              <a href={instance.url}>{new URL(instance.url).host}</a>
            </td>
            <td>{instance.location}</td>
            <td>
              {instance.maintainer ? (
                <a href={instance.maintainerUrl}>{instance.maintainer}</a>
              ) : 'Anonymous'}
            </td>
            <td>
              <img src={`https://img.shields.io/website.svg?label=&url=${instance.url}/test/cache`} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
