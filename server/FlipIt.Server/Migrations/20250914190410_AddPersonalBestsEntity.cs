using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FlipIt.Server.Migrations
{
    /// <inheritdoc />
    public partial class AddPersonalBestsEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PersonalBestScores",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    GameMode = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Difficulty = table.Column<string>(type: "TEXT", maxLength: 20, nullable: true),
                    BestMoves = table.Column<int>(type: "INTEGER", nullable: false),
                    BestTimeInSeconds = table.Column<int>(type: "INTEGER", nullable: false),
                    AchievedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    TotalGamesPlayed = table.Column<int>(type: "INTEGER", nullable: false),
                    SuccessRate = table.Column<decimal>(type: "TEXT", nullable: false),
                    UserId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PersonalBestScores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PersonalBestScores_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PersonalBestScores_UserId_GameMode_Difficulty",
                table: "PersonalBestScores",
                columns: new[] { "UserId", "GameMode", "Difficulty" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PersonalBestScores");
        }
    }
}
