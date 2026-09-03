# ──────────────────────────────────────────────────────────────
# Stage 1: Build Angular SPA
# ──────────────────────────────────────────────────────────────
FROM node:22-alpine AS spa-build
WORKDIR /spa

# Install dependencies first (layer cache)
COPY tms-client/package*.json ./
RUN npm ci --silent

# Copy source and build for production
COPY tms-client/ ./
RUN npx ng build --configuration production

# ──────────────────────────────────────────────────────────────
# Stage 2: Build .NET API
# ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS api-build
WORKDIR /src

# Restore (layer cache)
COPY TmsCore.Domain/TmsCore.Domain.csproj            TmsCore.Domain/
COPY TmsCore.Application/TmsCore.Application.csproj  TmsCore.Application/
COPY TmsCore.Infrastructure/TmsCore.Infrastructure.csproj TmsCore.Infrastructure/
COPY TmsCore.Api/TmsCore.Api.csproj                  TmsCore.Api/
RUN dotnet restore TmsCore.Api/TmsCore.Api.csproj

# Copy everything and publish
COPY . .
RUN dotnet publish TmsCore.Api/TmsCore.Api.csproj \
    -c Release -o /app/publish --no-restore

# Copy the Angular build output into wwwroot so the API can serve it
COPY --from=spa-build /spa/dist/tms-client/browser /app/publish/wwwroot

# ──────────────────────────────────────────────────────────────
# Stage 3: Runtime image
# ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

# Render terminates TLS at the edge — the container only needs HTTP
ENV ASPNETCORE_HTTP_PORTS=8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

COPY --from=api-build /app/publish .

ENTRYPOINT ["dotnet", "TmsCore.Api.dll"]
