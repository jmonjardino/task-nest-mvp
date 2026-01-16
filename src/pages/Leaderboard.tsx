import { LeaderboardRow } from "@/components/LeaderboardRow";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, TrendingUp, Users, Award } from "lucide-react";

export default function Leaderboard() {
  const individualRanking = [
    { rank: 1, name: "Pedro Costa", points: 2450, tasksCompleted: 48, trend: "up" as const },
    { rank: 2, name: "Ana Rodrigues", points: 2280, tasksCompleted: 42, trend: "up" as const },
    { rank: 3, name: "João Silva", points: 2150, tasksCompleted: 45, trend: "down" as const },
    { rank: 4, name: "Maria Santos", points: 1980, tasksCompleted: 38, trend: "up" as const },
    { rank: 5, name: "Carlos Mendes", points: 1850, tasksCompleted: 35, trend: "same" as const },
    { rank: 6, name: "Luís Ferreira", points: 1720, tasksCompleted: 32, trend: "up" as const },
    { rank: 7, name: "Sofia Alves", points: 1650, tasksCompleted: 30, trend: "down" as const },
    { rank: 8, name: "Ricardo Sousa", points: 1520, tasksCompleted: 28, trend: "same" as const },
  ];

  const teamRanking = [
    { rank: 1, name: "Equipa Logística", points: 5840, tasksCompleted: 92, trend: "up" as const },
    { rank: 2, name: "Equipa Armazém A", points: 5120, tasksCompleted: 86, trend: "up" as const },
    { rank: 3, name: "Equipa Expedição", points: 4680, tasksCompleted: 78, trend: "down" as const },
    { rank: 4, name: "Equipa Armazém B", points: 4250, tasksCompleted: 71, trend: "up" as const },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient */}
      <div className="bg-gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur">
              <Trophy className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Ranking de Pontos</h1>
              <p className="text-primary-foreground/80 text-lg">
                Competição saudável para melhores resultados
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-card shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-accent/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Pontos</p>
                <p className="text-2xl font-bold">18,450</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-card shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success/10 rounded-lg">
                <Users className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Colaboradores Ativos</p>
                <p className="text-2xl font-bold">24</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-card shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Award className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tarefas Concluídas</p>
                <p className="text-2xl font-bold">342</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Rankings Tabs */}
        <Tabs defaultValue="individual" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="individual" className="gap-2">
                <Trophy className="w-4 h-4" />
                Individual
              </TabsTrigger>
              <TabsTrigger value="teams" className="gap-2">
                <Users className="w-4 h-4" />
                Equipas
              </TabsTrigger>
            </TabsList>
            <Button variant="outline">Esta Semana</Button>
          </div>

          <TabsContent value="individual">
            <Card className="p-6">
              <div className="space-y-1">
                {individualRanking.map((player) => (
                  <LeaderboardRow key={player.rank} {...player} />
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="teams">
            <Card className="p-6">
              <div className="space-y-1">
                {teamRanking.map((team) => (
                  <LeaderboardRow key={team.rank} {...team} />
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Achievement Section */}
        <Card className="p-8 mt-8 mb-8 bg-gradient-to-r from-accent/10 via-transparent to-primary/10">
          <div className="text-center">
            <Trophy className="w-16 h-16 text-accent mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-2">Continue a Subir!</h3>
            <p className="text-muted-foreground mb-4">
              Complete mais tarefas e conquiste prémios exclusivos
            </p>
            <Button size="lg" className="gap-2">
              <Award className="w-5 h-5" />
              Ver Prémios Disponíveis
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
