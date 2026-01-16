import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStatsProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  variant?: "default" | "accent" | "success";
}

export function DashboardStats({
  title,
  value,
  description,
  icon: Icon,
  trend,
  variant = "default",
}: DashboardStatsProps) {
  const variantStyles = {
    default: "bg-primary/10 text-primary",
    accent: "bg-gradient-accent text-accent-foreground",
    success: "bg-success/10 text-success",
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
          <h3 className="text-3xl font-bold mb-1">{value}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
          {trend && (
            <p
              className={cn(
                "text-sm font-medium mt-2",
                trend.positive ? "text-success" : "text-destructive"
              )}
            >
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-xl", variantStyles[variant])}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
}
