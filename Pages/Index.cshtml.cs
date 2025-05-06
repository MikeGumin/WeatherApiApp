using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using WeatherApiApp.Models;
using WeatherApiApp.Services;

namespace WeatherApiApp.Pages
{
    public class IndexModel : PageModel
    {
        private readonly WeatherService _weatherService;
        public IndexModel(WeatherService weatherService)
        {
            _weatherService = weatherService;
        }

        [BindProperty]
        public string City { get; set; }
        public WeatherInfo? Weather { get; set; }
        public bool WasSubmitted { get; set; }

        public async Task OnPostAsync()
        {
            WasSubmitted = true;

            if (!string.IsNullOrEmpty(City))
            {
                Weather = await _weatherService.GetWeatherInfoAsync(City);
            }
         }

    }
}
