using System;
using System.Collections.Generic;
using System.Net.Http;
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

        public ProjectController(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        private async Task<IEnumerable<ProjectViewModel>?> FetchUserProjectsAsync()
        {
            var httpClient = _httpClientFactory.CreateClient();
            var request = new HttpRequestMessage(HttpMethod.Get, "http://simplex-backend-service:8080/api/Project/Projects");

            var token = Request.Cookies["JWTToken"];
            if (string.IsNullOrEmpty(token))
            {
                // Indicate that a redirect is necessary
                return null;
            }
            
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);
            
            var response = await httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                var projectsJson = await response.Content.ReadAsStringAsync();
                var projects = JsonConvert.DeserializeObject<IEnumerable<ProjectViewModel>>(projectsJson);

                return projects ?? new List<ProjectViewModel>();
            }
            else
            {
                // Handle error or return an empty list
                return new List<ProjectViewModel>();
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
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

            try
            {
                var response = await httpClient.SendAsync(request);

                if (response.IsSuccessStatusCode)
                {
                    return RedirectToAction("Index", "Project");
                }
                else
                {
                    // Handle failure
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return StatusCode((int)response.StatusCode, errorContent);
                }
            }
            catch (HttpRequestException e)
            {
                // Log exception details
                return StatusCode(500, $"Internal server error: {e.Message}");
            }
        }
    }
}
