using Microsoft.AspNetCore.Mvc;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using SimpLeX_Frontend.Models;

namespace SimpLeX_Frontend.Controllers
{
    public class ImagesController : Controller
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IMemoryCache _cache;
        private readonly ILogger<EditorController> _logger;

        public ImagesController(IHttpClientFactory httpClientFactory, IMemoryCache cache, ILogger<EditorController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _cache = cache;
            _logger = logger;
        }
        
        [HttpGet]
        public async Task<IActionResult> GetProjectImages(string projectId)
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
            var response = await httpClient.GetAsync($"http://simplex-backend-service:8080/api/Images/GetImages?projectId={projectId}");

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

        
        // Adjusted to handle IFormFile directly instead of base64 strings.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UploadImage()
        {
            var file = Request.Form.Files[0];
            var projectId = Request.Form["projectId"].ToString();
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file selected");
            }
            if (string.IsNullOrWhiteSpace(projectId))
            {
                return BadRequest("Project ID is required.");
            }

            var httpClient = _httpClientFactory.CreateClient("BackendService"); // Ensure this client is correctly configured
            var token = Request.Cookies["JWTToken"];
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized("Token is not supplied.");
            }

            using var formData = new MultipartFormDataContent();
            using var fileContent = new StreamContent(file.OpenReadStream());
            fileContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);  // Dynamically assign the correct content type

            formData.Add(fileContent, "file", file.FileName);
            formData.Add(new StringContent(projectId), "projectId");

            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var response = await httpClient.PostAsync("http://simplex-backend-service:8080/api/Images/UploadImage", formData);

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

        [HttpDelete]
        public async Task<IActionResult> DeleteImage(string imagePath)
        {
            if (string.IsNullOrWhiteSpace(imagePath))
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
            var response = await httpClient.DeleteAsync($"http://simplex-backend-service:8080/api/Images/DeleteImage?imagePath={Uri.EscapeDataString(imagePath)}");

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
