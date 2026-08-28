namespace TmsCore.Application.Models;


public class Course
{
    private int capacity;


    public string CourseCode { get; set; } = "";


    // Module 2 additions

    public string Code { get; set; } = "";

    public string Title { get; set; } = "";

    public int EnrolledCount { get; set; }



    public int Capacity
    {
        get
        {
            return capacity;
        }


        set
        {
            if(value < 0)
            {
                throw new ArgumentOutOfRangeException(
                    nameof(Capacity),
                    "Course capacity cannot be negative."
                );
            }

            capacity = value;
        }
    }
}
