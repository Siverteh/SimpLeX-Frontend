using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace SimpLeX_Frontend.Controllers
{
    public class DocumentController : Controller
    {
        private readonly IHttpClientFactory _clientFactory;

        public DocumentController(IHttpClientFactory clientFactory)
        {
            _clientFactory = clientFactory;
        }

        [HttpGet]
        public IActionResult Compile()
        {
            return View();
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Compile(string latexCode)
        {
            var compileRequest = new
            {
                LatexCode = latexCode
            };

            var client = _clientFactory.CreateClient();
            var response = await client.PostAsync("http://simplex-backend-service:8080/api/Document/Compile", 
                new StringContent(System.Text.Json.JsonSerializer.Serialize(compileRequest), Encoding.UTF8, "application/json"));

            if (response.IsSuccessStatusCode)
            {
                var pdfStream = await response.Content.ReadAsStreamAsync();
                return File(pdfStream, "application/pdf", "compiledDocument.pdf");
            }
            else
            {
                // Handle error or unsuccessful compilation
                ViewBag.ErrorMessage = "Failed to compile document.";
                return View();
            }
        }
    }
}