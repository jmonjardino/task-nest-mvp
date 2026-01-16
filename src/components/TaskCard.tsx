import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, User, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  assignee: string;
  deadline: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  points: number;
  onComplete?: (id: string) => void;
}

export function TaskCard({
  id,
  title,
  description,
  assignee,
  deadline,
  status,
  points,
  onComplete,
}: TaskCardProps) {
  const statusConfig = {
    pending: { color: "bg-secondary", icon: Clock, label: "Pendente" },
    "in-progress": { color: "bg-primary", icon: Clock, label: "Em Progresso" },
    completed: { color: "bg-success", icon: CheckCircle2, label: "Concluída" },
    overdue: { color: "bg-destructive", icon: AlertCircle, label: "Atrasada" },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  return (
    <Card className="p-4 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        </div>
        <Badge className={cn("ml-2", config.color)}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {config.label}
        </Badge>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        <div className="flex items-center gap-1">
          <User className="w-4 h-4" />
          <span>{assignee}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{deadline}</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-accent px-3 py-1 rounded-full">
            <span className="text-sm font-bold text-accent-foreground">{points} pts</span>
          </div>
        </div>
        {status === "in-progress" && onComplete && (
          <Button size="sm" onClick={() => onComplete(id)}>
            Concluir
          </Button>
        )}
      </div>
    </Card>
  );
}
