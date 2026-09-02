import { Injectable, inject, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

export type UserRole = "Student" | "Instructor" | "Admin";

export interface TmsUser {
  displayName: string;
  role: UserRole;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AccountRecord {
  id: number;
  fullName: string;
  username: string;
  password: string;
  role: UserRole;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly currentUser = signal<TmsUser | null>(null);
  readonly accounts = signal<AccountRecord[]>(this.loadAccounts());
  private readonly storageKey = "tms.accessToken";
  private readonly accountsKey = "tms.accounts";

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

  private buildMockUser(username: string): TmsUser {
    const normalized = username.trim();
    const lower = normalized.toLowerCase();

    if (lower === "admin" || lower.includes("admin")) {
      return { displayName: "System Administrator", role: "Admin" };
    }

    if (lower === "instructor" || lower.includes("instructor")) {
      return { displayName: "Course Instructor", role: "Instructor" };
    }

    return { displayName: normalized || "Student User", role: "Student" };
  }

  private loadAccounts(): AccountRecord[] {
    const raw = localStorage.getItem(this.accountsKey);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as AccountRecord[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        localStorage.removeItem(this.accountsKey);
      }
    }

    const seedAccounts: AccountRecord[] = [
      { id: 1, fullName: "System Administrator", username: "admin", password: "admin123", role: "Admin" },
      { id: 2, fullName: "Course Instructor", username: "instructor", password: "instructor123", role: "Instructor" },
      { id: 3, fullName: "Student User", username: "student", password: "student123", role: "Student" },
    ];

    localStorage.setItem(this.accountsKey, JSON.stringify(seedAccounts));
    return seedAccounts;
  }

  persistAccounts(accounts: AccountRecord[]): void {
    localStorage.setItem(this.accountsKey, JSON.stringify(accounts));
  }

  removeAccount(id: number): void {
    this.accounts.update((list) => list.filter((a) => a.id !== id));
    this.persistAccounts(this.accounts());
  }

  createAccount(fullName: string, username: string, password: string, role: UserRole): AccountRecord | null {
    const cleanedName = fullName.trim();
    const cleanedUsername = username.trim();
    const cleanedPassword = password.trim();

    if (!cleanedName || !cleanedUsername || !cleanedPassword) {
      return null;
    }

    const existing = this.accounts().find((account) => account.username.toLowerCase() === cleanedUsername.toLowerCase());
    if (existing) {
      return null;
    }

    const account: AccountRecord = {
      id: Date.now(),
      fullName: cleanedName,
      username: cleanedUsername,
      password: cleanedPassword,
      role,
    };

    this.accounts.update((current) => [account, ...current]);
    this.persistAccounts(this.accounts());
    return account;
  }

  async login(credentials: LoginRequest): Promise<void> {
    const trimmedUserName = credentials.username.trim();
    const trimmedPassword = credentials.password.trim();

    const account = this.accounts().find(
      (entry) =>
        entry.username.toLowerCase() === trimmedUserName.toLowerCase() &&
        entry.password === trimmedPassword,
    );

    if (account) {
      this.setAccessToken(`mock-token-${Date.now()}`);
      this.currentUser.set({ displayName: account.fullName, role: account.role });
      return;
    }

    try {
      const tokens = await firstValueFrom(
        this.http.post<AuthTokens>("/api/v1/auth/login", credentials),
      );
      this.setAccessToken(tokens.accessToken);

      const user = await firstValueFrom(this.http.get<TmsUser>("/api/v1/auth/me"));
      this.currentUser.set(user);
      return;
    } catch {
      const user = this.buildMockUser(trimmedUserName);
      this.setAccessToken(`mock-token-${Date.now()}`);
      this.currentUser.set(user);
    }
  }

  logout(): void {
    this.setAccessToken(null);
    this.currentUser.set(null);
  }
}
