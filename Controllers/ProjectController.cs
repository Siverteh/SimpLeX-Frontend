using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using SimpLeX_Frontend.Models;

namespace SimpLeX_Frontend.Controllers
{
    public class ProjectController : Controller
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ILogger<EditorController> _logger;

        public ProjectController(IHttpClientFactory httpClientFactory, ILogger<EditorController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _logger = logger;
        }

        private async Task<IEnumerable<ProjectViewModel>?> FetchUserProjectsAsync()
        {
            var httpClient = _httpClientFactory.CreateClient();
            var request = new HttpRequestMessage(HttpMethod.Get, "http://simplex-backend-service:8080/api/Project/Projects");

            var token = Request.Cookies["JWTToken"];
            if (string.IsNullOrEmpty(token))
            {
                // Log this situation if needed
                _logger.LogWarning("JWT Token is missing. User is probably not logged in.");
                return null; // Indicate that a redirect to the login might be necessary
            }
    
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
    
            var response = await httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                var projectsJson = await response.Content.ReadAsStringAsync();
                var projects = JsonConvert.DeserializeObject<IEnumerable<ProjectViewModel>>(projectsJson);
                return projects ?? new List<ProjectViewModel>(); // Safeguard against null
            }
            else
            {
                // Log the specific error
                _logger.LogError("Failed to fetch projects: {StatusCode}. Reason: {ReasonPhrase}", response.StatusCode, response.ReasonPhrase);
                return new List<ProjectViewModel>();
            }
        }

        private string GetUserIdJWT(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                return null;
            }

            try
            {
                var handler = new JwtSecurityTokenHandler();
                var jwtToken = handler.ReadJwtToken(token);
                var userId = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value;
                return userId;
            }
            catch
            {
                return null;
            }
        }


        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var projects = await FetchUserProjectsAsync();
            if (projects == null)
            {
                // If FetchUserProjectsAsync returned null, redirect to the login page
                return RedirectToAction("Login", "Auth");
            }
            
            var userId = GetUserIdJWT(Request.Cookies["JWTToken"]);
            ViewData["CurrentUserId"] = userId;
            
            return View(projects);
        }
        
        [HttpPost]
        public async Task<IActionResult> CreateProject(ProjectViewModel model)
        {
            var httpClient = _httpClientFactory.CreateClient();
            var projectCreationUrl = "http://simplex-backend-service:8080/api/Project/Create"; // URL of your backend service

            var token = Request.Cookies["JWTToken"];
            if (string.IsNullOrEmpty(token))
            {
                // If no JWT token redirect to login page.
                return RedirectToAction("Login", "Auth");
            }

            var request = new HttpRequestMessage(HttpMethod.Post, projectCreationUrl)
            {
                Content = new StringContent(JsonConvert.SerializeObject(new { Title = model.Title }), Encoding.UTF8, "application/json")
            };

            // Attach the JWT token in Authorization header
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            
            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                var createProjectResponse = JsonConvert.DeserializeObject<dynamic>(responseContent);
                var projectId = (string)createProjectResponse?.projectId!;
        
                // Redirect to the Edit action in the Editor controller, passing projectId
                return RedirectToAction("Edit", "Editor", new { projectId = projectId });
            }
            else
            {
                // Handle failure
                var errorContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, errorContent);
            }
        }
        
        [HttpPost]
        public async Task<IActionResult> CopyProject(ProjectViewModel model)
        {
            var httpClient = _httpClientFactory.CreateClient();
            var copyProjectUrl = "http://simplex-backend-service:8080/api/Project/CopyProject";

            var token = Request.Cookies["JWTToken"];
            if (string.IsNullOrEmpty(token))
            {
                return RedirectToAction("Login", "Auth");
            }
            
            _logger.LogInformation(model.ToString());

            var request = new HttpRequestMessage(HttpMethod.Post, copyProjectUrl)
            {
                Content = new StringContent(JsonConvert.SerializeObject(new { ProjectId = model.ProjectId, Title = model.Title }), Encoding.UTF8, "application/json")
            };
            
            _logger.LogInformation(request.ToString());
            
            
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
    
            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                return RedirectToAction("Index", "Project");
            }
            else
            {
                // Handle error
                ViewBag.ErrorMessage = "Failed to copy the project.";
                return RedirectToAction("Index", "Project");
            }
        }
        
        [HttpGet]
        public async Task<IActionResult> ExportAsPDF(string projectId)
        {
            var httpClient = _httpClientFactory.CreateClient(); // Use named HttpClient configuration if necessary
            var compileUrl = $"http://simplex-backend-service:8080/api/Project/ExportAsPDF/{projectId}";

            // Include the JWT token if authentication is required
            var token = Request.Cookies["JWTToken"];
            if (!string.IsNullOrEmpty(token))
            {
                httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            }
            else
            {
                // Redirect to login or handle the missing token as appropriate
                return RedirectToAction("Login", "Auth");
            }

            // Send the request to compile and get the PDF
            var response = await httpClient.GetAsync(compileUrl);

            if (response.IsSuccessStatusCode)
            {
                // Read the content of the response
                var contentDisposition = response.Content.Headers.ContentDisposition;
                var filename = contentDisposition?.FileNameStar ?? "project.pdf";
                
                var fileContent = await response.Content.ReadAsByteArrayAsync();
                
                // Return the file
                return File(fileContent, "application/pdf", filename);
            }
            else
            {
                // Handle error or return an error message
                ViewBag.ErrorMessage = "Failed to export the project as PDF.";
                return RedirectToAction("Index", "Project"); // Assume you have an Error view to show error messages
            }
        }

        
        [HttpGet]
        public async Task<IActionResult> ExportAsTeX(string projectId)
        {
            var httpClient = _httpClientFactory.CreateClient(); // Ensure you have named HttpClient configuration if necessary
            var requestUrl = $"http://simplex-backend-service:8080/api/Project/ExportAsTeX/{projectId}";

            // Include the JWT token if authentication is required
            var token = Request.Cookies["JWTToken"];
            if (!string.IsNullOrEmpty(token))
            {
                httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            }
            else
            {
                // Redirect to login or handle the missing token as appropriate
                return RedirectToAction("Login", "Auth");
            }

            // Send the request to get the TeX content
            var response = await httpClient.GetAsync(requestUrl);

            if (response.IsSuccessStatusCode)
            {
                // Get the filename from the Content-Disposition header if set
                var contentDisposition = response.Content.Headers.ContentDisposition;
                var filename = contentDisposition?.FileNameStar ?? "project.tex";

                // Read the content of the response
                var fileContent = await response.Content.ReadAsByteArrayAsync();

                // Return the file
                return File(fileContent, "application/x-tex", filename);
            }
            else
            {
                // Handle error or return an error message
                ViewBag.ErrorMessage = "Failed to export the project.";
                return RedirectToAction("Index", "Project"); // Assume you have an Error view to show error messages
            }
        }
        
        [HttpPost]
        public async Task<IActionResult> DeleteProject(string projectId)
        {
            var httpClient = _httpClientFactory.CreateClient();
            var deleteProjectUrl = $"http://simplex-backend-service:8080/api/Project/Delete/{projectId}"; // URL of your backend service for project deletion

            var token = Request.Cookies["JWTToken"];
            if (string.IsNullOrEmpty(token))
            {
                // If no JWT token redirect to login page.
                return RedirectToAction("Login", "Auth");
            }

            var request = new HttpRequestMessage(HttpMethod.Delete, deleteProjectUrl);
            // Attach the JWT token in Authorization header
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                // Redirect to the Index action (or wherever you list the projects) to show the updated list
                return RedirectToAction("Index");
            }
            else
            {
                // Handle failure, perhaps by showing an error message or logging the error
                return RedirectToAction("Index", new { errorMessage = "Failed to delete the project." });
            }
        }
        
        [HttpPost]
        public async Task<IActionResult> LeaveProject(string projectId)
        {
            var httpClient = _httpClientFactory.CreateClient();
            var leaveProjectUrl = $"http://simplex-backend-service:8080/api/Project/LeaveProject/{projectId}";

            var token = Request.Cookies["JWTToken"];
            if (string.IsNullOrEmpty(token))
            {
                // If no JWT token redirect to login page.
                return RedirectToAction("Login", "Auth");
            }

            var request = new HttpRequestMessage(HttpMethod.Delete, leaveProjectUrl);
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            var response = await httpClient.SendAsync(request);

            if (response.IsSuccessStatusCode)
            {
                // Redirect to the Index action (or wherever you list the projects) to show the updated list
                return RedirectToAction("Index");
            }
            else
            {
                // Handle failure, perhaps by showing an error message or logging the error
                return RedirectToAction("Index", new { errorMessage = "Failed to leave the project." });
            }
        }

    }
}
