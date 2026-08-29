import { Injectable, inject, signal } from "@angular/core";
import { EnrollmentStore } from "../store/enrollment.store";
import { HubConnection, HubConnectionBuilder, HubConnectionState } from "@microsoft/signalr";

export type LiveSyncState = "disconnected" | "connecting" | "connected";

@Injectable({ providedIn: "root" })
export class LiveSyncService {
  private readonly store = inject(EnrollmentStore);
  readonly state = signal<LiveSyncState>("disconnected");

  private readonly hubConnection: HubConnection = new HubConnectionBuilder()
    .withUrl("https://localhost:5001/hubs/tms?studentId=42")
    .withAutomaticReconnect()
    .build();

  constructor() {
    this.hubConnection.onclose(() => this.state.set("disconnected"));
    this.hubConnection.onreconnected(() => this.state.set("connected"));
    this.hubConnection.onreconnecting(() => this.state.set("connecting"));

    this.hubConnection.on("ReceiveGradePosted", (courseCode: string, studentId: number, grade: number) => {
      this.store.applyLiveGradeUpdate(courseCode, studentId, grade);
    });

    this.hubConnection.on("ReceiveCourseUpdate", (courseCode: string, message: string) => {
      this.store.applyLiveCourseUpdate(courseCode, message);
    });
  }

  async start(): Promise<void> {
    if (this.hubConnection.state === HubConnectionState.Connected) {
      return;
    }

    this.state.set("connecting");

    try {
      await this.hubConnection.start();
      this.state.set("connected");
    } catch (error) {
      this.state.set("disconnected");
      console.warn("SignalR connection failed.", error);
    }
  }

  async joinCourse(courseCode: string): Promise<void> {
    if (this.hubConnection.state !== HubConnectionState.Connected) {
      await this.start();
    }

    if (this.hubConnection.state === HubConnectionState.Connected) {
      await this.hubConnection.invoke("JoinCourseGroup", courseCode).catch((error) => {
        console.warn(`Unable to join course group ${courseCode}.`, error);
      });
    }
  }
}
