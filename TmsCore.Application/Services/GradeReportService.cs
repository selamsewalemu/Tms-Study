using TmsCore.Application.Interfaces;

namespace TmsCore.Application.Services;

public static class GradeReportService
{
	public static void PrintGradeReport(IGradable item)
	{
		ArgumentNullException.ThrowIfNull(item);
		Console.WriteLine($"Grade: {item.CalculateGrade():F2}%");
	}
}


