import { ApplicationConfig, inject, isDevMode, provideZonelessChangeDetection } from "@angular/core";
import { provideHttpClient, withInterceptors, withXsrfConfiguration } from "@angular/common/http";
import { provideRouter, withComponentInputBinding } from "@angular/router";
import { provideServiceWorker } from "@angular/service-worker";
import { routes } from "./app.routes";
import { LiveSyncService } from "./services/live-sync.service";
import { credentialsInterceptor } from "./interceptors/credentials.interceptor";
import { authInterceptor } from "./interceptors/auth.interceptor";
import { errorInterceptor } from "./interceptors/error.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(
      withInterceptors([credentialsInterceptor, authInterceptor, errorInterceptor]),
      withXsrfConfiguration({
        cookieName: "XSRF-TOKEN",
        headerName: "X-XSRF-TOKEN",
      }),
    ),
    provideServiceWorker("ngsw-worker.js", {
      // Only register the service worker in production
      enabled: !isDevMode(),
      registrationStrategy: "registerWhenStable:30000",
    }),
    {
      provide: "APP_BOOTSTRAP_LISTENER",
      multi: true,
      useFactory: () => {
        const liveSync = inject(LiveSyncService);
        return () => {
          liveSync.start();
        };
      },
    },
  ],
};
