using System;
using System.ComponentModel.DataAnnotations;

namespace SimpLeX_Frontend.Models
{
    public class ProjectViewModel
    {
        public string ProjectId { get; set; } // Unique identifier for the project
        public string Title { get; set; } // Title of the project
        public string Owner { get; set; }
        
        public string LatexCode { get; set; }
        
        public string UserId { get; set; } // Owner of the project
        public DateTime LastModifiedDate { get; set; } // Last modified date/time of the project

        // You might also consider adding URLs or commands for Actions if they're dynamically generated
        // For simplicity, actions could be handled directly in the view or with dedicated methods in the controller
    }
}