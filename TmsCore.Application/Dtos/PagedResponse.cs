namespace TmsCore.Application.Dtos;

// Module 6 Exercise 4 Part A: Define the response metadata required by a client paginator.
public sealed record PagedResponse<T>
{
	// Question 1: Return only the items on the requested page.
	public required IReadOnlyList<T> Items { get; init; }
	// Question 2: Return the filtered total before pagination.
	public required int TotalCount { get; init; }
	// Question 3: Echo the requested page number.
	public required int Page { get; init; }
	// Question 4: Echo the server-clamped page size.
	public required int PageSize { get; init; }
	// Question 5: Calculate how many pages the total requires.
	public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
	// Question 6: Tell clients whether a previous page exists.
	public bool HasPrevious => Page > 1;
	// Question 7: Tell clients whether a next page exists.
	public bool HasNext => Page < TotalPages;
}
