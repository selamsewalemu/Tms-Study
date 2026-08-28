namespace TmsCore.Domain.Entities;

// Module 5 Exercise 1: Persistence-ready student entity with a surrogate key.
public class Student
{
	public int Id { get; set; }
	public required string RegistrationNumber { get; set; }
	public required string Name { get; set; }
	public decimal GPA { get; set; }
	public bool IsActive { get; set; } = true;
	public bool IsDeleted { get; set; }
	public uint Version { get; set; }
	public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}
