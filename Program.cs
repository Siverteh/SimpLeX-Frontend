using System;
using System.Collections.Generic;
using System.Net.WebSockets;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddHttpClient();
builder.Services.AddMemoryCache(); // Add this line

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

if (Environment.GetEnvironmentVariable("ASPNETCORE_DETAILEDERRORS") == "true")
{
    app.UseDeveloperExceptionPage();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    ServeUnknownFileTypes = true, // Security risk if enabled globally
    DefaultContentType = "application/octet-stream", // Fallback MIME type
    // Alternatively, map the specific .ftl extension to a MIME type:
    ContentTypeProvider = new FileExtensionContentTypeProvider(new Dictionary<string, string>
    {
        { ".ftl", "text/plain" } // Assuming .ftl files are plain text
    })
});


app.UseRouting();

app.UseAuthentication();

app.UseAuthorization();

app.UseWebSockets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Auth}/{action=Login}/{id?}");

app.Run();
