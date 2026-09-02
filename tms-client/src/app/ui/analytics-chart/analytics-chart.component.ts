import { Component, computed, input, signal } from "@angular/core";
import { Enrollment } from "../../models/enrollment.model";

interface Slice {
  status: string;
  count: number;
  percentage: number;
  color: string;
  glowColor: string;
  /** SVG path for the pie wedge */
  path: string;
  /** Arc midpoint for label lines */
  midX: number;
  midY: number;
}

@Component({
  selector: "tms-analytics-chart",
  standalone: true,
  templateUrl: "./analytics-chart.component.html",
  styleUrl: "./analytics-chart.component.scss",
})
export class AnalyticsChartComponent {
  readonly data = input.required<Enrollment[]>();

  /** Which slice is hovered (for tooltip) */
  readonly hoveredSlice = signal<string | null>(null);

  private readonly CX = 120;
  private readonly CY = 120;
  private readonly R  = 95;
  private readonly INNER_R = 52; // donut hole

  private readonly COLORS: Record<string, { fill: string; glow: string }> = {
    Approved: { fill: "#22c55e", glow: "rgba(34, 197, 94,  0.45)" },
    Pending:  { fill: "#fbbf24", glow: "rgba(251, 191, 36, 0.45)" },
    Rejected: { fill: "#f87171", glow: "rgba(248, 113, 113, 0.45)" },
  };

  readonly approvedCount = computed(() =>
    this.data().filter((e) => e.status === "Approved").length,
  );
  readonly pendingCount = computed(() =>
    this.data().filter((e) => e.status === "Pending").length,
  );
  readonly rejectedCount = computed(() =>
    this.data().filter((e) => e.status === "Rejected").length,
  );
  readonly totalCount = computed(() => this.data().length);

  readonly slices = computed<Slice[]>(() => {
    const total = this.totalCount();
    const counts: Array<{ status: string; count: number }> = [
      { status: "Approved", count: this.approvedCount() },
      { status: "Pending",  count: this.pendingCount() },
      { status: "Rejected", count: this.rejectedCount() },
    ];

    // If no data, return three equal placeholder slices
    if (total === 0) {
      return counts.map((item, i) => {
        const startAngle = i * (360 / 3) - 90;
        const endAngle   = startAngle + 120;
        return {
          ...item,
          percentage: 0,
          color:     this.COLORS[item.status]?.fill    ?? "#334155",
          glowColor: this.COLORS[item.status]?.glow    ?? "transparent",
          path:      this.buildPath(startAngle, endAngle),
          midX:      this.midPoint(startAngle, endAngle).x,
          midY:      this.midPoint(startAngle, endAngle).y,
        };
      });
    }

    const result: Slice[] = [];
    let startAngle = -90; // start from top

    for (const item of counts) {
      if (item.count === 0) continue;
      const angle     = (item.count / total) * 360;
      const endAngle  = startAngle + angle;
      const pct       = Math.round((item.count / total) * 100);
      const mid       = this.midPoint(startAngle, endAngle);

      result.push({
        status:    item.status,
        count:     item.count,
        percentage: pct,
        color:     this.COLORS[item.status]?.fill    ?? "#334155",
        glowColor: this.COLORS[item.status]?.glow    ?? "transparent",
        path:      this.buildPath(startAngle, endAngle),
        midX:      mid.x,
        midY:      mid.y,
      });

      startAngle = endAngle;
    }

    return result;
  });

  /** Tooltip data for the currently hovered slice */
  readonly tooltip = computed<Slice | null>(() => {
    const h = this.hoveredSlice();
    if (!h) return null;
    return this.slices().find((s) => s.status === h) ?? null;
  });

  // ── SVG helpers ─────────────────────────────────────────────────

  private toRad(deg: number): number {
    return (deg * Math.PI) / 180;
  }

  private polarToCart(angleDeg: number, radius: number): { x: number; y: number } {
    const rad = this.toRad(angleDeg);
    return {
      x: +(this.CX + radius * Math.cos(rad)).toFixed(4),
      y: +(this.CY + radius * Math.sin(rad)).toFixed(4),
    };
  }

  private midPoint(startAngle: number, endAngle: number): { x: number; y: number } {
    const mid = (startAngle + endAngle) / 2;
    const r   = this.R * 0.72; // label sits at 72% of outer radius
    return this.polarToCart(mid, r);
  }

  private buildPath(startAngle: number, endAngle: number): string {
    const span     = endAngle - startAngle;
    const largeArc = span > 180 ? 1 : 0;

    const outerStart = this.polarToCart(startAngle, this.R);
    const outerEnd   = this.polarToCart(endAngle,   this.R);
    const innerStart = this.polarToCart(startAngle, this.INNER_R);
    const innerEnd   = this.polarToCart(endAngle,   this.INNER_R);

    return [
      `M ${outerStart.x} ${outerStart.y}`,
      `A ${this.R} ${this.R} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      `L ${innerEnd.x} ${innerEnd.y}`,
      `A ${this.INNER_R} ${this.INNER_R} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
      "Z",
    ].join(" ");
  }
}
