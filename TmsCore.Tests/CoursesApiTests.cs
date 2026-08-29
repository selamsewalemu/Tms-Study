using System.Net;
using System.Net.Http.Json;
using Xunit;

namespace TmsCore.Tests;

public class CoursesApiTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public CoursesApiTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetCourses_ReturnsOkAndPagedJson()
    {
        var response = await _client.GetAsync("/api/v2/courses?page=1&pageSize=10");

        response.EnsureSuccessStatusCode();

        var page = await response.Content.ReadFromJsonAsync<PagedCoursesJson>();

        Assert.NotNull(page);
        Assert.NotNull(page.Items);
    }

    [Fact]
    public async Task CreateCourse_InvalidCode_ReturnsValidationError()
    {
        var response = await _client.PostAsJsonAsync("/api/v2/courses", new
        {
            code = "",
            title = "Intro to TMS Security",
            maxCapacity = 30
        });

        Assert.True(response.StatusCode is HttpStatusCode.BadRequest or HttpStatusCode.UnprocessableEntity);
    }

    private sealed class PagedCoursesJson
    {
        public List<CourseRowJson> Items { get; set; } = new();
        public int TotalCount { get; set; }
    }

    private sealed class CourseRowJson
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public int MaxCapacity { get; set; }
        public int EnrollmentCount { get; set; }
    }
}
