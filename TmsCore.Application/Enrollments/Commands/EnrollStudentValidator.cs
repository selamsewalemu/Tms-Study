using FluentValidation;

namespace TmsCore.Application.Enrollments.Commands;

public sealed class EnrollStudentValidator : AbstractValidator<EnrollStudentCommand>
{
	public EnrollStudentValidator()
	{
		RuleFor(command => command.StudentId)
			.GreaterThan(0)
			.WithMessage("Student ID must be a positive number.");
		RuleFor(command => command.CourseCode)
			.NotEmpty()
			.WithMessage("Course code is required.")
			.Matches("^[A-Z]{3}-\\d{3}$")
			.WithMessage("Course code must follow the format XXX-000 (e.g., CSE-101).");
	}
}

