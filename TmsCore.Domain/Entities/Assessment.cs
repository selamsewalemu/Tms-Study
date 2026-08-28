namespace TmsCore.Domain.Entities;

// Module 5 Extended Exercise: Assessment entity reserved for the extended migration.
public class Assessment
{
	public int Id { get; set; }
	public required string Title { get; set; }
	public decimal MaxScore { get; set; }
	public decimal Weight { get; set; }
	public int CourseId { get; set; }
	public Course Course { get; set; } = null!;
}
