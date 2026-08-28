import { Temporal } from "@js-temporal/polyfill";

// Exercise 6: Define one reusable response wrapper for every API data type.
export type ApiResponse<T> =
  | { status: "loading" }
  | { status: "success"; data: T; fetchedAt: Temporal.Instant }
  | { status: "error"; message: string; statusCode: number };

// Exercise 6: Render every API response state with a type-safe formatter.
export function renderResponse<T>(
  response: ApiResponse<T>,
  formatter: (data: T) => string,
): string {
  switch (response.status) {
    case "loading":
      return "Loading...";
    case "success":
      return formatter(response.data);
    case "error":
      return `Error ${response.statusCode}: ${response.message}`;
    default: {
      const check: never = response;
      throw new Error(`Unhandled response status: ${JSON.stringify(check)}`);
    }
  }
}
