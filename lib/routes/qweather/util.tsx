import { renderToString } from 'hono/jsx/dom/server';

interface WeatherForecastItem {
    fxDate: string;
    textDay: string;
    textNight: string;
    tempMin: number;
    tempMax: number;
    humidity: number;
    aqi: number;
    aqiCategory: string;
    pressure: number;
    uvIndex: number;
    windDirDay: string;
    windScaleDay: number;
    windSpeedDay: number;
    windDirNight: string;
    windScaleNight: number;
    windSpeedNight: number;
    vis: number;
    sunrise: string;
    sunset: string;
    moonPhase: string;
    moonset: string;
}

interface NowItem {
    text: string;
    temp: number;
    feelsLike: number;
    windDir: string;
    windScale: number;
    windSpeed: number;
    humidity: number;
    pressure: number;
    precip: number;
    vis: number;
}

const render3DaysDescription = (item: WeatherForecastItem) => renderToString(<WeatherForecast item={item} />);
const renderNowDescription = (item: NowItem) => renderToString(<Now item={item} />);

const WeatherForecast = ({ item }: { item: WeatherForecastItem }) => (
    <p>
        白天：{item.textDay}——夜间：{item.textNight}
        <br />
        气温：{item.tempMin}℃~{item.tempMax}℃
        <br />
        相对湿度：{item.humidity}%
        <br />
        空气质量指数：{item.aqi} ({item.aqiCategory})
        <br />
        大气压强：{item.pressure}百帕
        <br />
        紫外线强度：{item.uvIndex}
        <br />
        白天风向：{item.windDirDay} 风力：{item.windScaleDay}级 风速：{item.windSpeedDay}公里/小时
        <br />
        夜间风向：{item.windDirNight} 风力：{item.windScaleNight}级 风速：{item.windSpeedNight}公里/小时
        <br />
        能见度：{item.vis}公里
        <br />
        日出：{item.sunrise} 日落： {item.sunset}
        <br />
        月相：{item.moonPhase} 月出：{item.sunrise} 月落：{item.moonset}
    </p>
);

const Now = ({ item }: { item: NowItem }) => (
    <p>
        天气：{item.text}
        <br />
        气温：{item.temp}℃
        <br />
        体感温度：{item.feelsLike}℃
        <br />
        风向：{item.windDir}
        <br />
        风力：{item.windScale}级 风速：{item.windSpeed}km/h
        <br />
        湿度：{item.humidity}% 大气压强：{item.pressure}hPa
        <br />
        本小时降水量：{item.precip}mm
        <br />
        能见度：{item.vis}km
    </p>
);

export { type NowItem, render3DaysDescription, renderNowDescription, type WeatherForecastItem };
