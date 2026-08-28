using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TmsCore.Domain.Entities;

namespace TmsCore.Infrastructure.Persistence;

// Module 5 Exercise 8: Configure enrollment timestamps and explicit foreign-key behavior.
public sealed class EnrollmentConfiguration : IEntityTypeConfiguration<Enrollment>
{
	public void Configure(EntityTypeBuilder<Enrollment> builder)
	{
		// Question 1: Make archive state queryable and default to active.
		builder.Property(enrollment => enrollment.IsArchived).HasDefaultValue(false);
		// Question 2: Keep enrollment timestamps in UTC.
		builder.Property(enrollment => enrollment.EnrolledAt).HasColumnType("timestamp with time zone");
		// Question 3: Remove enrollments when their student is deleted.
		builder.HasOne(enrollment => enrollment.Student)
			.WithMany(student => student.Enrollments)
			.HasForeignKey(enrollment => enrollment.StudentId)
			.OnDelete(DeleteBehavior.Cascade);
		// Question 4: Prevent deleting a course that still has enrollment rows.
		builder.HasOne(enrollment => enrollment.Course)
			.WithMany(course => course.Enrollments)
			.HasForeignKey(enrollment => enrollment.CourseId)
			.OnDelete(DeleteBehavior.Restrict);
	}
}
