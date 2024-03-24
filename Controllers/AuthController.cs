using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using SimpLeX_Frontend.Models;

namespace SimpLeX_Frontend.Controllers;

public class AuthController : Controller
{
    [HttpGet]
    public IActionResult Login()
    {
        return View();
    }

    [HttpPost]
    public IActionResult Login(string username, string password)
    {
        // Authentication logic here
        // If successful, redirect to a different page
        // If failure, return the view with an error message
        return View();
    }
    
    [HttpGet]
    public IActionResult Register()
    {
        return View();
    }

    [HttpPost]
    public IActionResult Register(string username, string password)
    {
        // Authentication logic here
        // If successful, redirect to a different page
        // If failure, return the view with an error message
        return View();
    }
}
