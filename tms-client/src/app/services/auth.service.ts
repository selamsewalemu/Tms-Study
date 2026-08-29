import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

export interface TmsUser {
  displayName: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly currentUser = signal<TmsUser | null>(null);
  private readonly storageKey = "tms.accessToken";

  hasRole(role: string): boolean {
    const user = this.currentUser();
    return user?.role === role || user?.role === "Admin";
  }

  isAuthenticated(): boolean {
    return !!this.getAccessToken() && !!this.currentUser();
  }

  getAccessToken(): string | null {
    return sessionStorage.getItem(this.storageKey);
  }

  private setAccessToken(token: string | null): void {
    if (!token) {
      sessionStorage.removeItem(this.storageKey);
      return;
    }

    sessionStorage.setItem(this.storageKey, token);
  }

  async login(credentials: LoginRequest): Promise<void> {
    const tokens = await firstValueFrom(
      this.http.post<AuthTokens>("/api/v1/auth/login", credentials),
    );

    this.setAccessToken(tokens.accessToken);

    const user = await firstValueFrom(this.http.get<TmsUser>("/api/v1/auth/me"));
    this.currentUser.set(user);
  }

  logout(): void {
    this.setAccessToken(null);
    this.currentUser.set(null);
  }
}
