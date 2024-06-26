using System.ComponentModel.DataAnnotations;

namespace SimpLeX_Frontend.Models
{
    public class LoginViewModel
    {
        [Required]
        [Display(Name = "Username")]
        public string UserName { get; set; }

        [Required]
        [DataType(DataType.Password)]
        [Display(Name = "Password")]
        public string Password { get; set; }
    }
    public class AuthResponse
    {
        public string Token { get; set; }
    }

}