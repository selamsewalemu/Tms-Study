namespace TmsCore.Application.Dtos;

// Module 6 Exercise 4 Part A: Define bounded collection request parameters.
public sealed record PagedRequest
{
	// Question 1: Keep the maximum page size in one place.
	private const int MaxPageSize = 50;
	// Question 2: Store the default page size.
	private int pageSize = 20;
	// Question 3: Keep page numbers one-based for client readability.
	public int Page { get; init; } = 1;
	// Question 4: Clamp hostile or invalid page sizes at model-binding time.
	public int PageSize
	{
		get => pageSize;
		init => pageSize = value < 1 ? 20 : value > MaxPageSize ? MaxPageSize : value;
	}
	// Question 5: Optionally filter by course code or title.
	public string? Search { get; init; }
	// Question 6: Default to a stable human-readable sort field.
	public string OrderBy { get; init; } = "Title";
	// Question 7: Allow either ascending or descending order.
	public bool Descending { get; init; }
}
