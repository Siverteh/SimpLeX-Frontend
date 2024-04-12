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
            var compileRequest = new 
            {
                ProjectId = model.ProjectId,
                LatexCode = model.LatexCode,
                WorkspaceState = "" // Assuming workspace state is not needed for compilation
            };

            var token = Request.Cookies["JWTToken"];
            if (string.IsNullOrEmpty(token))
            {
                return RedirectToAction("Login", "Auth");
            }

            var request = new HttpRequestMessage(HttpMethod.Post, "http://simplex-backend-service:8080/api/Editor/Compile")
            {
                Content = new StringContent(JsonConvert.SerializeObject(compileRequest), Encoding.UTF8, "application/json")
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await httpClient.SendAsync(request);
            if (response.IsSuccessStatusCode)
            {
                var pdfBytes = await response.Content.ReadAsByteArrayAsync();
                var pdfBase64 = Convert.ToBase64String(pdfBytes);
                var wordCount = response.Headers.Contains("X-Word-Count") ? response.Headers.GetValues("X-Word-Count").FirstOrDefault() : "0";

                ViewBag.PdfData = pdfBase64;
                return Json(new { success = true, pdfData = pdfBase64, wordCount = wordCount });
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                ViewBag.ErrorMessage = "Failed to compile document.";
                return Json(new { success = false, message = "Failed to compile document.", errorMessage = errorContent });
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
        
        [HttpGet]
        public IActionResult GetUserInfo()
        {
            // Assuming you have a method to decode the JWT and extract the user info
            var userInfo = GetUserInfoFromJWT(Request.Cookies["JWTToken"]);
            if(userInfo == null)
            {
                return Unauthorized("User is not authenticated.");
            }
            return Ok(userInfo);
        }

        private object GetUserInfoFromJWT(string token)
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
                var userName = jwtToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value; 
                return new { UserId = userId, UserName = userName };
            }
            catch
            {
                return null;
            }
        }
        
        [HttpGet("ProxyShare/{projectId}")]
        public async Task<IActionResult> ProxyShare(string projectId)
        {
            var backendServiceUrl = $"http://simplex-backend-service:8080/api/Editor/Share/{projectId}";
            var token = HttpContext.Request.Cookies["JWTToken"]; // Retrieving JWT token from the request cookies

            var httpClient = _httpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await httpClient.GetAsync(backendServiceUrl);

            if (response.IsSuccessStatusCode)
            {
                var linkJson = await response.Content.ReadAsStringAsync();
                return Content(linkJson, "application/json");
            }
            else
            {
                // If there were errors, log them and return an error message
                _logger.LogError($"Failed to generate share link: {response.StatusCode}");
                return StatusCode((int)response.StatusCode, "Failed to generate share link");
            }
        }
        
        [HttpGet("Redeem/{token}")]
        public async Task<IActionResult> Redeem(string token)
        {
            var httpClient = _httpClientFactory.CreateClient();
            var jwtToken = Request.Cookies["JWTToken"];
            
            if (string.IsNullOrEmpty(token))
            {
                return RedirectToAction("Login", "Auth");
            }
            
            httpClient.DefaultRequestHeaders.Add("Authorization", "Bearer " + jwtToken);
            
            var response = await httpClient.GetAsync($"http://simplex-backend-service:8080/api/Editor/RedeemInvitation/{token}");

            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                
                var responseData = JsonConvert.DeserializeAnonymousType(content, new { message = "", projectId = "" });
                
                return Redirect($"http://10.225.149.19:31688/Editor/Edit?projectId={responseData?.projectId}");
            }
            else
            {
                ViewBag.ErrorMessage = "error failed.";
                return Json(new { success = false, message = "error failed." });
            }
        }
    }
}
