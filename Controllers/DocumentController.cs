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
            if (Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") == "Development")
            {
                _client = new Kubernetes(KubernetesClientConfiguration.BuildConfigFromConfigFile());
            }
            else
            {
                _client = new Kubernetes(KubernetesClientConfiguration.InClusterConfig());
            }
        }

        [HttpGet]
        public IActionResult Compile()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> Compile(string latexCode)
        {
            // Path within the PVC where the LaTeX file and PDF will be stored
            var dataPath = "/mnt/data/latex-data";
            var texFilePath = Path.Combine(dataPath, "document.tex");
            var pdfFilePath = Path.Combine(dataPath, "document.pdf");

            // Write the LaTeX code to a file
            System.IO.File.WriteAllText(texFilePath, latexCode);

            // Define the Kubernetes job to compile the LaTeX document
            var jobName = $"latex-compilation-{Guid.NewGuid()}";
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
                                    VolumeMounts = new List<V1VolumeMount>
                                        { new V1VolumeMount { Name = "latex-data", MountPath = "/data" } }
                                }
                            },
                            Volumes = new List<V1Volume>
                            {
                                new V1Volume
                                {
                                    Name = "latex-data",
                                    PersistentVolumeClaim = new V1PersistentVolumeClaimVolumeSource
                                        { ClaimName = "latex-pvc" }
                                }
                            },
                            RestartPolicy = "Never"
                        }
                    }
                }
            };

            // Create the Kubernetes job
            await _client.CreateNamespacedJobAsync(job, "default");

            // Monitor the job completion
            bool isJobCompleted = false;
            while (!isJobCompleted)
            {
                await Task.Delay(1000); // Simple delay for polling the job status
                var currentJob = await _client.ReadNamespacedJobAsync(jobName, "default");
                if (currentJob.Status.CompletionTime.HasValue)
                {
                    isJobCompleted = true;
                }
            }

            // Serve the compiled PDF
            if (System.IO.File.Exists(pdfFilePath))
            {
                var pdfContent = await System.IO.File.ReadAllBytesAsync(pdfFilePath);
                return File(pdfContent, "application/pdf", "compiled_document.pdf");
            }

            return NotFound("Compiled document not found.");
        }
    }
}