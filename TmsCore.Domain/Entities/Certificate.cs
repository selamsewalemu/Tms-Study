namespace TmsCore.Domain.Entities;

// Module 5 Extended Exercise: Certificate entity reserved for the extended migration.
public class Certificate
{
	public int Id { get; set; }
	public required string SerialNumber { get; set; }
	public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
	public int StudentId { get; set; }
	public int CourseId { get; set; }
	public Student Student { get; set; } = null!;
	public Course Course { get; set; } = null!;
}
