// This using imports EF Core types used by the configuration below.
using Microsoft.EntityFrameworkCore;
// This using imports EntityTypeBuilder, which configures one entity type.
using Microsoft.EntityFrameworkCore.Metadata.Builders;
// This using imports the TMS Student entity being configured.
using TmsCore.Domain.Entities;

// This namespace groups the database configuration classes.
namespace TmsCore.Infrastructure.Persistence;

// Module 5 Exercise 8: Configure audit, concurrency, soft-delete, and student relationships.
// This class is discovered by ApplyConfigurationsFromAssembly in TmsDbContext.
public sealed class StudentConfiguration : IEntityTypeConfiguration<Student>
{
	// EF calls this method while constructing the database model.
	public void Configure(EntityTypeBuilder<Student> builder)
	{
		// Question 1: Keep the human registration number unique without using it as the primary key.
		// This executable statement creates a unique database index.
		builder.HasIndex(student => student.RegistrationNumber).IsUnique();
		// Question 2: Store the audit stamp as a shadow property outside the DTO shape.
		// This executable statement declares a property that is not present on Student.
		builder.Property<DateTime>("LastUpdated")
			// This executable chain call selects the PostgreSQL timestamp type.
			.HasColumnType("timestamp without time zone")
			// This executable chain call supplies the database default value.
			.HasDefaultValueSql("CURRENT_TIMESTAMP");
		// Question 3: Use PostgreSQL xmin as the optimistic concurrency token.
		// This executable statement selects the Student Version property.
		builder.Property(student => student.Version)
			// This executable chain call maps Version to PostgreSQL xmin.
			.HasColumnName("xmin")
			// This executable chain call marks the value for concurrency checks.
			.IsRowVersion();
		// Question 4: Hide soft-deleted students from ordinary IQueryable queries.
		// This executable statement adds the global filter used by normal queries.
		builder.HasQueryFilter(student => !student.IsDeleted);
		// Question 5: Explicitly cascade student deletion to dependent enrollments.
		// This executable statement begins the student-to-enrollment relationship.
		builder.HasMany(student => student.Enrollments)
			// This executable chain call identifies the inverse navigation property.
			.WithOne(enrollment => enrollment.Student)
			// This executable chain call identifies the foreign-key property.
			.HasForeignKey(enrollment => enrollment.StudentId)
			// This executable chain call configures dependent-row deletion.
			.OnDelete(DeleteBehavior.Cascade);
	}
}
