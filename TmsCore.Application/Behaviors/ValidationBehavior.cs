using FluentValidation;
using MediatR;

namespace TmsCore.Application.Behaviors;

public sealed class ValidationBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators)
	: IPipelineBehavior<TRequest, TResponse>
	where TRequest : notnull
{
	public async Task<TResponse> Handle(
		TRequest request,
		RequestHandlerDelegate<TResponse> next,
		CancellationToken ct)
	{
		IValidator<TRequest>[] requestValidators = validators.ToArray();
		if (requestValidators.Length == 0)
		{
			return await next();
		}

		ValidationContext<TRequest> context = new(request);
		List<FluentValidation.Results.ValidationFailure> failures = requestValidators
			.Select(validator => validator.Validate(context))
			.SelectMany(result => result.Errors)
			.Where(failure => failure is not null)
			.ToList();
		if (failures.Count > 0)
		{
			throw new ValidationException(failures);
		}

		return await next();
	}
}

