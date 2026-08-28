namespace TmsCore.Domain.Entities;

// Module 5 Exercise 1: Persistence-ready course entity with enrollment navigation.
public class Course
{
	public int Id { get; set; }
	public required string Code { get; set; }
	public required string Title { get; set; }
	public int MaxCapacity { get; set; }
	public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}
