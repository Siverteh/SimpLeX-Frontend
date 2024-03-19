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
            _client = new Kubernetes(KubernetesClientConfiguration.InClusterConfig());
        }

        [HttpGet]
        public IActionResult Compile()
        {
            return View();
        }

        /*[HttpPost]
        public async Task<IActionResult> Compile(string latexCode)
        {
            // Path within the PVC where the LaTeX file and PDF will be stored
            var dataPath = "/mnt/data/latex-data";
            var texFilePath = Path.Combine(dataPath, "document.tex");
            var pdfFilePath = Path.Combine(dataPath, "document.pdf");

            var directoryPath = Path.GetDirectoryName(texFilePath);
            if (!Directory.Exists(directoryPath))
            {
                Directory.CreateDirectory(directoryPath);
            }

            // Write the LaTeX code to a file
            try
            {
                System.IO.File.WriteAllText(texFilePath, latexCode);
            }
            catch (Exception ex)
            {
                // Log the exception
                return Problem(detail: $"Failed to write LaTeX code to file. Error: {ex.Message}");
            }

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
        }*/

        [HttpPost]
        public async Task<IActionResult> Compile(string latexCode)
        {
            var compilationId = Guid.NewGuid().ToString();

            // Get the base path from an environment variable or use a default
            var basePath = Path.Combine(Environment.GetEnvironmentVariable("LATEX_DATA_PATH") ?? "/mnt/data/latex-data");
            var texFilePath = Path.Combine(basePath, "document.tex");
            var pdfFilePath = Path.Combine(basePath, "document.pdf");

            try
            {
                // Ensure the directory exists
                var directoryPath = Path.GetDirectoryName(texFilePath);
                if (!Directory.Exists(directoryPath))
                {
                    Directory.CreateDirectory(directoryPath);
                }

                // Write the LaTeX code to a file
                System.IO.File.WriteAllText(texFilePath, latexCode);
            }
            catch (Exception ex)
            {
                return Problem(detail: $"An error occurred. Error: {ex.Message}");
            }

            // Define the Kubernetes job to compile the LaTeX document
            var jobName = $"latex-compilation-{compilationId}";
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
                                    Image = "siverteh/latex-compiler:latest",
                                    Env = new List<V1EnvVar>
                                    {
                                        new V1EnvVar("COMPILATION_ID", compilationId)
                                    },
                                    Command = new List<string>
                                    {
                                        "sh", "-c",
                                        @"
                                        mkdir -p /tmp/$COMPILATION_ID && \
                                        pdflatex -interaction=nonstopmode -output-directory=/tmp/$COMPILATION_ID /data/document.tex && \
                                        cp /tmp/$COMPILATION_ID/document.pdf /data/ && \
                                        rm -rf /tmp/$COMPILATION_ID
                                        "
                                    },
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
                                    PersistentVolumeClaim = new V1PersistentVolumeClaimVolumeSource
                                    {
                                        ClaimName = "latex-pvc"
                                    }
                                }
                            },
                            RestartPolicy = "Never"
                        }
                    }
                }
            };


            try
            {
                // Create the Kubernetes job
                await _client.CreateNamespacedJobAsync(job, "default");
            }
            catch (Exception ex)
            {
                return Problem(detail: $"Failed to create Kubernetes job. Error: {ex.Message}");
            }

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

            // Before serving the compiled PDF, ensure the job actually completed successfully.
            if (isJobCompleted)
            {
                if (System.IO.File.Exists(pdfFilePath))
                {
                    var pdfContent = await System.IO.File.ReadAllBytesAsync(pdfFilePath);
                    return File(pdfContent, "application/pdf", "compiled_document.pdf");
                }
                else
                {
                    return NotFound(
                        "Compiled document not found. The LaTeX compilation job completed, but no PDF was generated. Check job logs for errors.");
                }
            }
            else
            {
                return Problem(detail: "LaTeX compilation job did not complete successfully.");
            }
        }
    }
}