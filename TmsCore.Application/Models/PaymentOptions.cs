using System.ComponentModel.DataAnnotations;

namespace TmsCore.Application.Models;

// Module 4 Exercise 3: Strongly typed, startup-validated payment configuration.
public sealed class PaymentOptions
{
	[Required]
	public required string GatewayUrl { get; init; }

	[Range(100, 100000)]
	public decimal MaxDepositBirr { get; init; }
}
