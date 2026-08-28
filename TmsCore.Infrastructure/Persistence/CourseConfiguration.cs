using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TmsCore.Domain.Entities;

namespace TmsCore.Infrastructure.Persistence;

// Module 5 Exercise 8: Configure course keys and explicit course relationship behavior.
public sealed class CourseConfiguration : IEntityTypeConfiguration<Course>
{
	public void Configure(EntityTypeBuilder<Course> builder)
	{
		// Module 6 Question 1: Configure the required course fields and stable primary key.
		builder.HasKey(course => course.Id);
		builder.Property(course => course.Code).IsRequired().HasMaxLength(10);
		builder.Property(course => course.Title).IsRequired().HasMaxLength(200);
		builder.Property(course => course.MaxCapacity).IsRequired();
		// Question 1: Prevent duplicate business course codes.
		builder.HasIndex(course => course.Code).IsUnique();
		// Question 2: Restrict course deletion while enrollments still reference it.
		builder.HasMany(course => course.Enrollments)
			.WithOne(enrollment => enrollment.Course)
			.HasForeignKey(enrollment => enrollment.CourseId)
			.OnDelete(DeleteBehavior.Restrict);
	}
}
