using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TmsCore.Domain.Entities;
using TmsCore.Infrastructure.Identity;

namespace TmsCore.Infrastructure.Persistence;

// Module 5 Exercise 1: Group the first three persistence entities into one context.
public sealed class TmsDbContext(DbContextOptions<TmsDbContext> options) : IdentityDbContext<TmsUser>(options)
{
	public DbSet<Student> Students => Set<Student>();
	public DbSet<Course> Courses => Set<Course>();
	public DbSet<Enrollment> Enrollments => Set<Enrollment>();
	public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

	// Module 5 Exercise 8: Apply all entity rules from the configuration classes.
	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);
		modelBuilder.ApplyConfigurationsFromAssembly(typeof(TmsDbContext).Assembly);
	}
}
