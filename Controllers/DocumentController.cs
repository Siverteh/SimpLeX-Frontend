using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using k8s;
using k8s.Models;
using System.Linq;

namespace SimpLeX.Controllers
{
    public class DocumentController : Controller
    {
        private readonly Kubernetes _client;

        public DocumentController()
        {
            var config = KubernetesClientConfiguration.BuildConfigFromConfigFile();
            _client = new Kubernetes(config);
        }

        [HttpGet]
        public IActionResult Compile()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Compile(string latexCode)
        {
            // Step 1: Save LaTeX code to a temporary file
            var tempFilePath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString() + ".tex");
            System.IO.File.WriteAllText(tempFilePath, latexCode);

            // Assume a PersistentVolumeClaim is set up for /data
            // and tempFilePath needs to be copied or made available at /data/document.tex

            // Step 2: Create the Kubernetes job for LaTeX compilation
            var jobName = "latex-compilation-" + Guid.NewGuid().ToString();
            var job = new V1Job
            {
                ApiVersion = "batch/v1",
                Kind = "Job",
                Metadata = new V1ObjectMeta { Name = jobName },
                Spec = new V1JobSpec
                {
                    Template = new V1PodTemplateSpec
                    {
                        Spec = new V1PodSpec
                        {
                            Containers = new List<V1Container>
                            {
                                new V1Container
                                {
                                    Name = "latex-compiler",
                                    Image = "siverteh/latex-compiler",
                                    Args = new List<string> { "pdflatex", "-interaction=nonstopmode", "document.tex" },
                                    VolumeMounts = new List<V1VolumeMount>
                                    {
                                        new V1VolumeMount { Name = "latex-data", MountPath = "/data" }
                                    }
                                }
                            },
                            Volumes = new List<V1Volume>
                            {
                                new V1Volume
                                {
                                    Name = "latex-data",
                                    PersistentVolumeClaim = new V1PersistentVolumeClaimVolumeSource { ClaimName = "latex-pvc" }
                                }
                            },
                            RestartPolicy = "Never"
                        }
                    }
                }
            };

            await _client.CreateNamespacedJobAsync(job, "default");

            // Step 3: Monitor job completion (simplified logic)
            bool isJobCompleted = false;
            while (!isJobCompleted)
            {
                var jobs = await _client.ListNamespacedJobAsync("default");
                var currentJob = jobs.Items.FirstOrDefault(j => j.Metadata.Name == jobName);
                if (currentJob != null && currentJob.Status.Succeeded.HasValue && currentJob.Status.Succeeded.Value > 0)
                {
                    isJobCompleted = true;
                }
                else
                {
                    // Implement a delay or a more sophisticated check with timeout
                    Task.Delay(1000).Wait();
                }
            }

            // Step 4: Retrieve and serve the compiled PDF (assuming the PDF is named document.pdf and stored in the same PVC)
            // This part needs customization based on how you access the PDF from the PVC
            var pdfPath = "/data/document.pdf"; // This path needs to be accessible by your application
            var pdfContent = System.IO.File.ReadAllBytes(pdfPath); // Adjust based on actual file retrieval method
            return File(pdfContent, "application/pdf", "compiled_document.pdf");
        }
    }
}
