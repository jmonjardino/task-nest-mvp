import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Trophy, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Target,
  Zap,
  Award,
  ArrowRight 
} from "lucide-react";
import tasknestLogo from "@/assets/tasknest-logo.png";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-primary text-primary-foreground">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="container relative mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur rounded-full mb-6">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Organização de Projetos Gamificada</span>
            </div>
            <img src={tasknestLogo} alt="TaskNest" className="h-20 md:h-24 mx-auto mb-6" />
            <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Transforme a organização de projetos da sua equipa com gamificação e aumente a produtividade
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary" 
                className="gap-2 text-lg"
                onClick={() => navigate("/auth")}
              >
                Começar Agora
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 text-lg bg-white/10 hover:bg-white/20 border-white/20 text-primary-foreground"
                onClick={() => navigate("/leaderboard")}
              >
                <Trophy className="w-5 h-5" />
                Ver Ranking
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Funcionalidades Principais</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tudo o que precisa para gerir tarefas e motivar a sua equipa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="p-4 bg-primary/10 rounded-xl w-fit mb-4">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Organização de Tarefas</h3>
              <p className="text-muted-foreground">
                Crie, atribua e acompanhe tarefas com prazos. Notificações automáticas para tarefas pendentes.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="p-4 bg-success/10 rounded-xl w-fit mb-4">
                <Users className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Equipas de Trabalho</h3>
              <p className="text-muted-foreground">
                Forme grupos para tarefas específicas e acompanhe o desempenho coletivo.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="p-4 bg-accent/10 rounded-xl w-fit mb-4">
                <Trophy className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Sistema de Pontos</h3>
              <p className="text-muted-foreground">
                Gamificação com pontos por tarefas concluídas e ranking de colaboradores.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="p-4 bg-warning/10 rounded-xl w-fit mb-4">
                <Target className="w-8 h-8 text-warning" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Provas Digitais</h3>
              <p className="text-muted-foreground">
                Validação simples com upload de fotos ou texto para confirmar conclusão de tarefas.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="p-4 bg-primary/10 rounded-xl w-fit mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Dashboard Gestor</h3>
              <p className="text-muted-foreground">
                Acompanhe tarefas em aberto e desempenho dos colaboradores em tempo real.
              </p>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow">
              <div className="p-4 bg-accent/10 rounded-xl w-fit mb-4">
                <Award className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Motivação Contínua</h3>
              <p className="text-muted-foreground">
                Rankings e competições saudáveis para aumentar o engagement da equipa.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="p-12 bg-gradient-to-r from-primary/10 via-accent/10 to-success/10 border-none">
            <div className="text-center max-w-3xl mx-auto">
              <Trophy className="w-16 h-16 text-accent mx-auto mb-6" />
              <h2 className="text-4xl font-bold mb-4">
                Pronto para Aumentar a Produtividade?
              </h2>
              <p className="text-xl text-muted-foreground mb-8">
                Junte-se a outras PMEs que já estão a transformar a organização de projetos
              </p>
              <Button 
                size="lg" 
                className="gap-2 text-lg"
                onClick={() => navigate("/auth")}
              >
                Começar Agora
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Index;
