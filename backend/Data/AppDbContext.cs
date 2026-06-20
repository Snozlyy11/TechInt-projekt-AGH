using KreatorQuiz.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace KreatorQuiz.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Quiz> Quizzes => Set<Quiz>();
    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Option> Options => Set<Option>();
    public DbSet<QuizSubmission> Submissions => Set<QuizSubmission>();
    public DbSet<QuizSession> Sessions => Set<QuizSession>();
    public DbSet<SessionParticipant> SessionParticipants => Set<SessionParticipant>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<User>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Role).HasDefaultValue("user");
        });

        b.Entity<Quiz>(e =>
        {
            e.HasOne(q => q.User)
             .WithMany(u => u.Quizzes)
             .HasForeignKey(q => q.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<Question>(e =>
        {
            e.HasOne(q => q.Quiz)
             .WithMany(q => q.Questions)
             .HasForeignKey(q => q.QuizId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<Option>(e =>
        {
            e.HasOne(o => o.Question)
             .WithMany(q => q.Options)
             .HasForeignKey(o => o.QuestionId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<QuizSession>(e =>
        {
            e.HasIndex(s => s.Code).IsUnique();
            e.HasOne(s => s.Quiz).WithMany().HasForeignKey(s => s.QuizId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(s => s.Host).WithMany().HasForeignKey(s => s.HostUserId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<SessionParticipant>(e =>
        {
            e.HasOne(p => p.Session).WithMany(s => s.Participants).HasForeignKey(p => p.SessionId).OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<QuizSubmission>(e =>
        {
            e.HasOne(s => s.Quiz)
             .WithMany(q => q.Submissions)
             .HasForeignKey(s => s.QuizId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasOne(s => s.User)
             .WithMany(u => u.Submissions)
             .HasForeignKey(s => s.UserId)
             .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
