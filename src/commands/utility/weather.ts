import { Command, CommandExecuteOptions } from '../../types/command';
import axios from 'axios';

const weather: Command = {
  options: {
    name: 'weather',
    description: 'Get the current weather for a city.',
    category: 'utility',
    usage: '/weather <city>',
    
  },
  execute: async ({ message, args }: CommandExecuteOptions) => {
    if (!message) return;
    const city = args?.join(' ');
    if (!city) {
      await message.reply('Please provide a city name.');
      return;
    }
    try {
      // Geocoding to get lat/lon
      const geoRes = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`);
      const location = geoRes.data.results?.[0];
      if (!location) {
        await message.reply('City not found.');
        return;
      }
      const { latitude, longitude, name, country } = location;
      // Fetch weather
      const weatherRes = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
      const weather = weatherRes.data.current_weather;
      if (!weather) {
        await message.reply('Weather data not available.');
        return;
      }
      await message.reply(`Weather in ${name}, ${country}:\n🌡️ ${weather.temperature}°C, ${weather.weathercode === 0 ? 'Clear' : 'Cloudy/Other'}\n💨 Wind: ${weather.windspeed} km/h`);
    } catch (err) {
      await message.reply('Failed to fetch weather.');
    }
  }
};
export default weather; 