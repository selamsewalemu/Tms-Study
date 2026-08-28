using TmsCore.Application.Interfaces;

namespace TmsCore.Application.Models;

public class Quiz : IGradable
{
	public int CorrectAnswers { get; set; }
	public int TotalQuestions { get; set; }

	public decimal CalculateGrade()
	{
		if (TotalQuestions <= 0)
		{
			throw new InvalidOperationException("Total questions must be greater than zero.");
		}

		return (decimal)CorrectAnswers / TotalQuestions * 100m;
	}
}

