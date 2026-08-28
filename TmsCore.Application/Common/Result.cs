namespace TmsCore.Application.Common;

public readonly record struct Result<TValue, TError>
{
	private readonly TValue? value;
	private readonly TError? error;

	private Result(TValue value)
	{
		this.value = value;
		error = default;
		IsSuccess = true;
	}

	private Result(TError error)
	{
		value = default;
		this.error = error;
		IsSuccess = false;
	}

	public bool IsSuccess { get; }

	public static Result<TValue, TError> Success(TValue value) => new(value);
	public static Result<TValue, TError> Failure(TError error) => new(error);

	public TValue Value => IsSuccess
		? value!
		: throw new InvalidOperationException("Result is failure; call Match instead of Value.");

	public TError Error => !IsSuccess
		? error!
		: throw new InvalidOperationException("Result is success; call Match instead of Error.");

	public TOut Match<TOut>(Func<TValue, TOut> onSuccess, Func<TError, TOut> onFailure) =>
		IsSuccess ? onSuccess(value!) : onFailure(error!);
}

