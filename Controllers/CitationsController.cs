using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;

namespace SimpLeX_Frontend.Controllers
{
    public class CitationsController : Controller
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<CitationsController> _logger;

        public CitationsController(IHttpClientFactory httpClientFactory, ILogger<CitationsController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetCitations(string projectId)
        {
            if (string.IsNullOrWhiteSpace(projectId))
            {
                return BadRequest("Project ID is required.");
            }

            var httpClient = _httpClientFactory.CreateClient("BackendService");
            var token = Request.Cookies["JWTToken"];
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized("Token is not supplied.");
            }

            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var response = await httpClient.GetAsync($"http://simplex-backend-service:8080/api/Citations/GetCitations?projectId={projectId}");

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


        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> AddCitation([FromBody] CitationViewModel citation)
        {
            _logger.LogInformation($"Received citation to add: {JsonConvert.SerializeObject(citation)}");

            if (citation == null || string.IsNullOrWhiteSpace(citation.ProjectId))
            {
                return BadRequest("Citation details are required.");
            }

            var httpClient = _httpClientFactory.CreateClient("BackendService");
            var token = Request.Cookies["JWTToken"];
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized("Token is not supplied.");
            }

            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var content = new StringContent(JsonConvert.SerializeObject(citation), System.Text.Encoding.UTF8, "application/json");

            _logger.LogInformation($"Forwarding citation to backend: {content.ReadAsStringAsync().Result}");
            var response = await httpClient.PostAsync("http://simplex-backend-service:8080/api/Citations/AddCitation", content);

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


        [HttpDelete]
        public async Task<IActionResult> DeleteCitation(string citationId)
        {
            if (string.IsNullOrWhiteSpace(citationId))
            {
                return BadRequest("Image path is required.");
            }

            var httpClient = _httpClientFactory.CreateClient("BackendService");
            var token = Request.Cookies["JWTToken"];
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized("Token is not supplied.");
            }

            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var response = await httpClient.DeleteAsync($"http://simplex-backend-service:8080/api/Citations/DeleteCitation?citationId={Uri.EscapeDataString(citationId)}");

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
