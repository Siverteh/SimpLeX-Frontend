using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Hosting;
using SimpLeX.Services; // Ensure this using directive points to where your LatexService class is located.
using System.IO;

namespace SimpLeX.Controllers
{
    public class DocumentController : Controller
    {
        private readonly IWebHostEnvironment _environment;
        private readonly LatexService _latexService;

        public DocumentController(IWebHostEnvironment environment)
        {
            _environment = environment;
            _latexService = new LatexService(); // Initialize the LatexService.
        }

        public IActionResult CompileLatex()
        {
            // Assuming "LatexFiles" is directly under the project's root directory.
            var latexFilePath = Path.Combine(_environment.WebRootPath, "latex", "sample.tex");
            var pdfPath = _latexService.CompileLatexToPDF(latexFilePath);

            if (pdfPath != null)
            {
                return File(System.IO.File.ReadAllBytes(pdfPath), "application/pdf", "compiled_document.pdf");
            }
            else
            {
                return NotFound("Compilation failed or PDF not found.");
            }
        }
    }
}