FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY TmsCore.Domain/TmsCore.Domain.csproj TmsCore.Domain/
COPY TmsCore.Application/TmsCore.Application.csproj TmsCore.Application/
COPY TmsCore.Infrastructure/TmsCore.Infrastructure.csproj TmsCore.Infrastructure/
COPY TmsCore.Api/TmsCore.Api.csproj TmsCore.Api/
RUN dotnet restore TmsCore.Api/TmsCore.Api.csproj

COPY . .
RUN dotnet publish TmsCore.Api/TmsCore.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "TmsCore.Api.dll"]
