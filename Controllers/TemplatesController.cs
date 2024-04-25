using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using SimpLeX_Frontend.Models;

namespace SimpLeX_Frontend.Controllers
{
    public class TemplatesController : Controller
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<TemplatesController> _logger;

        public TemplatesController(IHttpClientFactory httpClientFactory, ILogger<TemplatesController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        // GET: Fetch all templates
        [HttpGet]
        public async Task<IActionResult> GetTemplates(bool isCustom, string userId = null)
        {
            var httpClient = _httpClientFactory.CreateClient("BackendService");
            var token = Request.Cookies["JWTToken"];
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized("Token is not supplied.");
            }

            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    
            // Build the query string based on whether templates are custom and whether a user ID is provided
            var queryString = $"isCustom={isCustom}" + (isCustom && !string.IsNullOrEmpty(userId) ? $"&userId={userId}" : string.Empty);
            var response = await httpClient.GetAsync($"http://simplex-backend-service:8080/api/Templates/GetTemplates?{queryString}");

            if (response.IsSuccessStatusCode)
            {
                var responseData = await response.Content.ReadAsStringAsync();
                return Content(responseData, "application/json");
            }
            else
            {
                return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
            }
        }


        // POST: Add a new template
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AddTemplate([FromBody] TemplateViewModel template)
        {
            _logger.LogInformation($"Received template to add: {JsonConvert.SerializeObject(template)}");

            if (template == null)
            {
                return BadRequest("Template details are required.");
            }

            var httpClient = _httpClientFactory.CreateClient("BackendService");
            var token = Request.Cookies["JWTToken"];
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized("Token is not supplied.");
            }

            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var content = new StringContent(JsonConvert.SerializeObject(template), System.Text.Encoding.UTF8, "application/json");

            _logger.LogInformation($"Forwarding template to backend: {content.ReadAsStringAsync().Result}");
            var response = await httpClient.PostAsync("http://simplex-backend-service:8080/api/Templates/AddTemplate", content);

            if (response.IsSuccessStatusCode)
            {
                var responseData = await response.Content.ReadAsStringAsync();
                _logger.LogInformation($"Backend response: {responseData}");
                return Content(responseData, "application/json");
            }
            else
            {
                var errorResponse = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Backend error response: {errorResponse}");
                return StatusCode((int)response.StatusCode, errorResponse);
            }
        }

        // DELETE: Delete a template
        [HttpDelete("{templateId}")]
        public async Task<IActionResult> DeleteTemplate(string templateId)
        {
            if (string.IsNullOrWhiteSpace(templateId))
            {
                return BadRequest("Template ID is required.");
            }

            var httpClient = _httpClientFactory.CreateClient("BackendService");
            var token = Request.Cookies["JWTToken"];
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized("Token is not supplied.");
            }

            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var response = await httpClient.DeleteAsync($"http://simplex-backend-service:8080/api/Templates/DeleteTemplate/{Uri.EscapeDataString(templateId)}");

            if (response.IsSuccessStatusCode)
            {
                return Ok(await response.Content.ReadAsStringAsync());
            }
            else
            {
                return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
            }
        }
    }
}
