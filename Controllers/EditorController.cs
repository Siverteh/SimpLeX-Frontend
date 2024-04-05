using Microsoft.AspNetCore.Mvc;
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Newtonsoft.Json;
using SimpLeX_Frontend.Models;

namespace SimpLeX_Frontend.Controllers
{
    public class EditorController : Controller
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IMemoryCache _cache;
        private readonly ILogger<EditorController> _logger;

        public EditorController(IHttpClientFactory httpClientFactory, IMemoryCache cache, ILogger<EditorController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _cache = cache;
            _logger = logger;
        }

        // GET: Editor/Edit/5
        public async Task<IActionResult> Edit(string projectId)
        {
            var httpClient = _httpClientFactory.CreateClient();
            var request = new HttpRequestMessage(HttpMethod.Get, $"http://simplex-backend-service:8080/api/Editor/{projectId}");

            var token = Request.Cookies["JWTToken"];
            if (string.IsNullOrEmpty(token))
            {
                return RedirectToAction("Login", "Auth");
            }

            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
        
            var response = await httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                var projectJson = await response.Content.ReadAsStringAsync();
                var project = JsonConvert.DeserializeObject<ProjectViewModel>(projectJson);
                if (project == null)
                {
                    return NotFound();
                }
            
                // Pass the project to the view
                return View("~/Views/Project/Editor.cshtml", project);
            }
            else
            {
                // Handle error or return an appropriate response
                return StatusCode((int)response.StatusCode, "Failed to load project");
            }
        }

        // POST: Editor/Compile
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Compile(ProjectViewModel model)
        {
            var httpClient = _httpClientFactory.CreateClient();
            var compileRequest = 
                new { ProjectId = model.ProjectId, LatexCode = model.LatexCode, WorkspaceState = "" };
            
            var token = Request.Cookies["JWTToken"];

            if (string.IsNullOrEmpty(token))
            {
                return RedirectToAction("Login", "Auth");
            }

            var request = new HttpRequestMessage(HttpMethod.Post, "http://simplex-backend-service:8080/api/Editor/Compile")
            {
                Content = new StringContent(JsonConvert.SerializeObject(compileRequest), Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            
            var response = await httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                var pdfBytes = await response.Content.ReadAsByteArrayAsync();
                var pdfBase64 = Convert.ToBase64String(pdfBytes);
                
                ViewBag.PdfData = pdfBase64;
                return Json(new { success = true, pdfData = pdfBase64 });
            }
            else
            {
                ViewBag.ErrorMessage = "Failed to compile document.";
                return Json(new { success = false, message = "Failed to compile document." });
            }
        }

        
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ProxySaveLatex(ProjectViewModel model)
        {
            var backendServiceUrl = "http://simplex-backend-service:8080/api/Editor/SaveLatex";
            var token = HttpContext.Request.Cookies["JWTToken"]; // Retrieving JWT token from the request cookies

            var httpClient = _httpClientFactory.CreateClient();

            // Constructing LatexRequest object for the autosave functionality
            var latexRequest = new
            {
                ProjectId = model.ProjectId,
                LatexCode = model.LatexCode,
                WorkspaceState = model.WorkspaceState
            };

            var requestContent = new StringContent(JsonConvert.SerializeObject(latexRequest), Encoding.UTF8, "application/json");

            // Forwarding the JWT token if present
            if (!string.IsNullOrEmpty(token))
            {
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            }

            var response = await httpClient.PostAsync(backendServiceUrl, requestContent);

            if (response.IsSuccessStatusCode)
            {
                // Autosave was successful, return OK status
                return Ok();
            }
            else
            {
                // If there were errors, forward the status code and response content from the backend service
                return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
            }
        }
        
        public IActionResult GoHome()
        {
            // Redirects to the Index action of the ProjectController
            return RedirectToAction("Index", "Project");
        }

    }
}
