using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using SimpLeX_Frontend.Models;

namespace SimpLeX_Frontend.Controllers
{
    public class AuthController : Controller
    {
        private readonly IHttpClientFactory _clientFactory;

        public AuthController(IHttpClientFactory clientFactory)
        {
            _clientFactory = clientFactory;
        }

        [HttpGet]
        public IActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Login(LoginViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }

            var user = new
            {
                model.UserName,
                model.Password
            };

            var httpContent = new StringContent(JsonConvert.SerializeObject(user), Encoding.UTF8, "application/json");
            var client = _clientFactory.CreateClient();
            var response = await client.PostAsync("http://simplex-backend-service:8080/api/Auth/Login", httpContent);

            if (response.IsSuccessStatusCode)
            {


                var responseContent = await response.Content.ReadAsStringAsync();
                var authResponse = JsonConvert.DeserializeObject<AuthResponse>(responseContent);

                // Check if the response actually includes a token
                if (authResponse?.Token != null)
                {
                    // Here you can choose how to store the token. For demonstration purposes, we'll use an authentication cookie.
                    // Note: It's important to implement a secure way to handle the JWT token. Consider using secure cookies or other secure storage mechanisms.
                    HttpContext.Response.Cookies.Append("JWTToken", authResponse.Token,
                        new CookieOptions { HttpOnly = true, Secure = true });

                    // Redirect to the Home page or dashboard upon successful login
                    return RedirectToAction("Index", "Project");
                }
                else
                {
                    ViewBag.ErrorMessage = "Token was not provided. Authentication failed.";
                    return View(model);
                }
            }
            else
            {
                // Optionally parse the response to display specific error messages
                var responseContent = await response.Content.ReadAsStringAsync();
                ViewBag.ErrorMessage = string.IsNullOrWhiteSpace(responseContent)
                    ? "An error occurred during registration. Please try again."
                    : responseContent;
                return View(model);
            }
        }

        [HttpGet]
        public IActionResult Register()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Register(RegisterViewModel model)
        {
            if (!ModelState.IsValid)
            {
                ViewBag.ErrorMessage = "Modelstate is invalid.";
                return View(model);
            }

            if (model.Password != model.ConfirmPassword)
            {
                ViewBag.ErrorMessage = "Passwords do not match.";
                return View(model);
            }

            if (!IsPasswordStrong(model.Password))
            {
                ViewBag.ErrorMessage =
                    "Password must be 8 characters long, contain an uppercase letter, and contain a number.";
                return View(model);
            }

            var user = new
            {
                UserName = model.UserName,
                Email = model.Email,
                Password = model.Password, // Ensure your backend handles password hashing
                ConfirmPassword = model.ConfirmPassword
            };

            var httpContent = new StringContent(JsonConvert.SerializeObject(user), Encoding.UTF8, "application/json");

            var client = _clientFactory.CreateClient();
            var response = await client.PostAsync("http://simplex-backend-service:8080/api/Auth/Register", httpContent);

            if (response.IsSuccessStatusCode)
            {
                // On successful registration, redirect to login or another appropriate page
                return RedirectToAction("Login");
            }
            else
            {
                // Use the response content directly as the error message
                var responseContent = await response.Content.ReadAsStringAsync();
                ViewBag.ErrorMessage = string.IsNullOrWhiteSpace(responseContent)
                    ? "An error occurred during registration. Please try again."
                    : responseContent;
                return View(model);
            }
        }

        private bool IsPasswordStrong(string password)
        {
            if (string.IsNullOrEmpty(password))
            {
                return false;
            }

            // Example rules - customize according to your needs
            var hasMinimum8Chars = password.Length >= 8;
            var hasUpperChar = password.Any(char.IsUpper);
            var hasMinimum1Number = password.Any(char.IsDigit);
            //var hasMinimum1SpecialChar = password.Any(ch => !char.IsLetterOrDigit(ch));

            return hasMinimum8Chars && hasUpperChar && hasMinimum1Number; //&& hasMinimum1SpecialChar;
        }
    }
}