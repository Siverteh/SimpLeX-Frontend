using System.Diagnostics;
using System.IO;

namespace SimpLeX_Frontend.Services
{
    public class LatexService
    {
        public string CompileLatexToPDF(string latexFilePath)
        {
            var outputPath = Path.GetDirectoryName(latexFilePath);
            var fileName = Path.GetFileNameWithoutExtension(latexFilePath);
            var startInfo = new ProcessStartInfo("C:\\Users\\siver\\AppData\\Local\\Programs\\MiKTeX\\miktex\\bin\\x64\\pdflatex")
            {
                Arguments = $"-output-directory={outputPath} {latexFilePath}",
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true,
                WorkingDirectory = outputPath
            };

            using (var process = Process.Start(startInfo))
            {
                process.WaitForExit();
                var outputFilePath = Path.Combine(outputPath, $"{fileName}.pdf");
                if (process.ExitCode == 0 && File.Exists(outputFilePath))
                {
                    return outputFilePath;
                }
                else
                {
                    // Log or handle error
                    return null;
                }
            }
        }
    }
}