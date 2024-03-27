using System;
using System.Collections.Generic;
using System.Net.Http;
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

    }
}
