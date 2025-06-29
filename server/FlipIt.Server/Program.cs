using Microsoft.EntityFrameworkCore;

using FlipIt.Server.Data;

var builder = WebApplication.CreateBuilder(args);

var appOrigin = builder.Configuration.GetValue<string>("ClientOrigins:FlipIt");

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<FlipItDbContext>(opt =>
{
    opt.UseSqlite(builder.Configuration
        .GetConnectionString("DefaultConnection"));
});

builder.Services.AddCors(cfg =>
{
    if (appOrigin != null)
    {
        cfg.AddPolicy("AllowClient", policyBld =>
        {
            policyBld
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials()
                .WithOrigins(appOrigin);
        });
    }
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider
        .GetRequiredService<FlipItDbContext>();
    db.Database.EnsureCreated();
}

app.UseCors("AllowClient");

app.UseHttpsRedirection();

app.Run();
