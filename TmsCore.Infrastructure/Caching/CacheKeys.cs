namespace TmsCore.Infrastructure.Caching;

public static class CacheKeys
{
	private const string SchemaVersion = "v2";

	public static string CoursesAll => $"{SchemaVersion}:courses:all";
	public const string CoursesTag = "courses";
}
