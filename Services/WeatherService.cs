using System.Text.Json;
using WeatherApiApp.Models;

namespace WeatherApiApp.Services
{
    public class WeatherService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey = "361fa9ef83a3c4d9828865941bbf4212";
        public WeatherService(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }
        public async Task<WeatherInfo> GetWeatherInfoAsync(string city)
        {
            var url = $"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={_apiKey}&units=metric&lang=ru"; //ссылка на openweathermap

            var response = await _httpClient.GetAsync(url);
            if (!response.IsSuccessStatusCode) return null;

            using var responseStream = await response.Content.ReadAsStreamAsync();
            using var doc = await JsonDocument.ParseAsync(responseStream);

            return new WeatherInfo
            {
                City = doc.RootElement.GetProperty("name").GetString(),
                Description = doc.RootElement.GetProperty("weather")[0].GetProperty("description").GetString(),
                Temperature = doc.RootElement.GetProperty("main").GetProperty("temp").GetDouble()
            };
        }
    }
}
