import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface TeamMember {
  id: string;
  name: string;
  points: number;
}

interface TeamCardProps {
  id: string;
  name: string;
  members: TeamMember[];
  tasksCompleted: number;
  totalPoints: number;
}

export function TeamCard({ name, members, tasksCompleted, totalPoints }: TeamCardProps) {
  return (
    <Card className="p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-sm text-muted-foreground">{members.length} membros</p>
          </div>
        </div>
        <Badge variant="outline" className="gap-1">
          <TrendingUp className="w-3 h-3" />
          {totalPoints} pts
        </Badge>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {members.slice(0, 4).map((member) => (
          <Avatar key={member.id} className="w-8 h-8">
            <AvatarFallback className="text-xs">
              {member.name.split(" ").map(n => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
        {members.length > 4 && (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
            +{members.length - 4}
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-border">
        <div className="text-sm">
          <span className="text-muted-foreground">Tarefas concluídas: </span>
          <span className="font-semibold">{tasksCompleted}</span>
        </div>
      </div>
    </Card>
  );
}
