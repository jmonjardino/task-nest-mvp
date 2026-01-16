import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaderboardRowProps {
  rank: number;
  name: string;
  points: number;
  tasksCompleted: number;
  trend?: "up" | "down" | "same";
}

export function LeaderboardRow({
  rank,
  name,
  points,
  tasksCompleted,
  trend = "same",
}: LeaderboardRowProps) {
  const getRankIcon = () => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-accent" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-muted-foreground" />;
    if (rank === 3) return <Award className="w-5 h-5 text-muted-foreground" />;
    return null;
  };

  const isTopThree = rank <= 3;

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg transition-all duration-200",
        isTopThree ? "bg-gradient-to-r from-accent/5 to-transparent" : "hover:bg-muted/50"
      )}
    >
      <div className="flex items-center justify-center w-10 h-10">
        {getRankIcon() || (
          <span className="font-bold text-lg text-muted-foreground">#{rank}</span>
        )}
      </div>

      <Avatar className="w-12 h-12">
        <AvatarFallback className={cn(isTopThree && "bg-accent/10")}>
          {name.split(" ").map(n => n[0]).join("").toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1">
        <h4 className="font-semibold">{name}</h4>
        <p className="text-sm text-muted-foreground">{tasksCompleted} tarefas concluídas</p>
      </div>

      <div className="text-right">
        <Badge className="bg-gradient-accent font-bold text-base px-3 py-1">
          {points} pts
        </Badge>
        {trend !== "same" && (
          <p className={cn("text-xs mt-1", trend === "up" ? "text-success" : "text-destructive")}>
            {trend === "up" ? "↑" : "↓"}
          </p>
        )}
      </div>
    </div>
  );
}
