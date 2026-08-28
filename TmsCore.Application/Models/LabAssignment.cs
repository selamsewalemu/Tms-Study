using TmsCore.Application.Interfaces;

namespace TmsCore.Application.Models;

public class LabAssignment : IGradable
{
	public decimal Score { get; set; }

	public decimal CalculateGrade()
	{
		return Score;
	}
}

