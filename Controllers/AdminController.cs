using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Net.Http.Headers;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Text;
using Microsoft.AspNetCore.Http;

namespace SimpLeX_Frontend.Controllers
{
    public class AdminController : Controller
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<AdminController> _logger;

        public AdminController(IHttpClientFactory httpClientFactory, ILogger<AdminController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        [HttpGet]
        public IActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> UploadImage(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                _logger.LogError("No file uploaded.");
                return View("Index", new { error = "No file uploaded." });
            }

            var httpClient = _httpClientFactory.CreateClient();
            var token = Request.Cookies["JWTToken"];
            
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized("Token is not supplied.");
            }
            
            using var formData = new MultipartFormDataContent();
            using var fileContent = new StreamContent(file.OpenReadStream());
            fileContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);  // Dynamically assign the correct content type

            formData.Add(fileContent, "file", file.FileName);

            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var response = await httpClient.PostAsync("http://simplex-backend-service:8080/api/Admin/UploadImage", formData);
            if (response.IsSuccessStatusCode)
            {
                return RedirectToAction("Index");
            }
            else
            {
                _logger.LogError($"Failed to upload image: {response.StatusCode}");
                return View("Index", new { error = "Failed to upload image." });
            }
        }

        [HttpPost]
        public async Task<IActionResult> AddTemplate(string templateName, string xmlContent, string imagePath)
        {
            var httpClient = _httpClientFactory.CreateClient();
            var templateData = new
            {
                TemplateName = templateName,
                XMLContent = xmlContent,
                ImagePath = imagePath,
                IsCustom = false
            };
            
            var token = Request.Cookies["JWTToken"];
            
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized("Token is not supplied.");
            }

            var content = new StringContent(JsonConvert.SerializeObject(templateData), Encoding.UTF8, "application/json");
            
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var response = await httpClient.PostAsync("http://simplex-backend-service:8080/api/Admin/AddTemplate", content);
            if (response.IsSuccessStatusCode)
            {
                return RedirectToAction("Index");
            }
            else
            {
                _logger.LogError($"Failed to add template: {response.StatusCode}");
                return View("Index", new { error = "Failed to add template." });
            }
        }
    }
}
