import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardStats } from "@/components/DashboardStats";
import { TaskCard } from "@/components/TaskCard";
import { TeamCard } from "@/components/TeamCard";
import { CreateTaskDialog } from "@/components/CreateTaskDialog";
import { CreateTeamDialog } from "@/components/CreateTeamDialog";
import { InviteCodeDialog } from "@/components/InviteCodeDialog";
import { PendingMembersDialog } from "@/components/PendingMembersDialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Users,
  Trophy,
  ListTodo,
  Medal,
  LogOut,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import tasknestLogo from "@/assets/tasknest-logo.png";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [membershipStatus, setMembershipStatus] = useState<string | null>(null);

  const [tasks, setTasks] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [inviteCodes, setInviteCodes] = useState<any[]>([]);
  const [pendingMembers, setPendingMembers] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      console.log('[DEBUG] Loading user data for user:', user?.id);

      // Check user role
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user?.id)
        .single();

      console.log('[DEBUG] Role data:', roleData, 'Error:', roleError);
      const userIsAdmin = roleData?.role === "admin";
      setIsAdmin(userIsAdmin);

      // Get profile with company
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user?.id)
        .single();

      console.log('[DEBUG] Profile data:', profileData, 'Error:', profileError);
      console.log('[DEBUG] Company ID from profile:', profileData?.company_id);

      setCompanyId(profileData?.company_id || null);

      // If no company, check membership status
      if (!profileData?.company_id) {
        console.log('[DEBUG] No company_id found, checking membership status');
        const { data: memberData } = await supabase
          .from("company_members")
          .select("status")
          .eq("user_id", user?.id)
          .order("invited_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        setMembershipStatus(memberData?.status || null);
      } else {
        console.log('[DEBUG] Company ID found, loading company data:', profileData.company_id);
      }

      if (profileData?.company_id) {
        await loadCompanyData(profileData.company_id, userIsAdmin);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCompanyData = async (compId: string, isAdm: boolean) => {
    try {
      // Load tasks
      const tasksQuery = supabase
        .from("tasks")
        .select(`
          *,
          profiles:assignee_id (full_name)
        `)
        .eq("company_id", compId)
        .order("created_at", { ascending: false });

      if (!isAdm) {
        tasksQuery.eq("assignee_id", user?.id);
      }

      const { data: tasksData, error: tasksError } = await tasksQuery;
      console.log('[DEBUG] Tasks query result:', {
        data: tasksData,
        error: tasksError,
        companyId: compId,
        isAdmin: isAdm
      });
      setTasks(tasksData || []);

      // Load teams (admin only)
      if (isAdm) {
        const { data: teamsData } = await supabase
          .from("teams")
          .select(`
            *,
            team_members (
              profiles (id, full_name, points)
            )
          `)
          .eq("company_id", compId);

        setTeams(teamsData || []);

        // Load invite codes
        const { data: inviteData } = await supabase
          .from("company_invitations")
          .select("*")
          .eq("company_id", compId)
          .order("created_at", { ascending: false });

        setInviteCodes(inviteData || []);

        // Load pending members
        const { data: pendingData, error: pendingError } = await supabase
          .from("company_members")
          .select(`
            *,
            profiles (full_name)
          `)
          .eq("company_id", compId)
          .eq("status", "pending");

        console.log('[DEBUG] Pending members query result:', {
          data: pendingData,
          error: pendingError,
          companyId: compId
        });
        setPendingMembers(pendingData || []);
      }
    } catch (error) {
      console.error("Error loading company data:", error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from("tasks")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      if (error) throw error;

      toast.success("Tarefa concluída!", {
        description: "Parabéns! Os pontos foram atribuídos.",
      });

      if (companyId) {
        await loadCompanyData(companyId, isAdmin);
      }
    } catch (error) {
      toast.error("Erro ao completar tarefa");
    }
  };

  const refreshData = () => {
    if (companyId) {
      loadCompanyData(companyId, isAdmin);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Show pending approval message for users without company
  if (!companyId && membershipStatus === "pending") {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <header className="border-b bg-card">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <img src={tasknestLogo} alt="TaskNest" className="h-10" />
              <Button variant="outline" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </header>
          <div className="container mx-auto px-4 py-20 text-center">
            <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Pedido Pendente</h2>
            <p className="text-muted-foreground">
              O seu pedido de entrada está pendente de aprovação pelo administrador.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // Show message if no company and no pending request
  if (!companyId) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <header className="border-b bg-card">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <img src={tasknestLogo} alt="TaskNest" className="h-10" />
              <Button variant="outline" onClick={signOut}>
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </header>
          <div className="container mx-auto px-4 py-20 text-center">
            <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Sem Empresa Associada</h2>
            <p className="text-muted-foreground">
              Entre em contato com um administrador para obter um código de convite.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const activeTasks = tasks.filter(
    (t) => t.status === "pending" || t.status === "in-progress"
  ).length;
  const completedToday = tasks.filter((t) => t.status === "completed").length;
  const totalPoints = tasks
    .filter((t) => t.status === "completed")
    .reduce((sum, t) => sum + t.points, 0);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <img src={tasknestLogo} alt="TaskNest" className="h-12" />
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <>
                    <InviteCodeDialog
                      companyId={companyId}
                      existingCodes={inviteCodes}
                      onCodeCreated={refreshData}
                    />
                    <PendingMembersDialog
                      pendingMembers={pendingMembers}
                      onMemberUpdated={refreshData}
                    />
                    <CreateTaskDialog
                      companyId={companyId}
                      onCreateTask={refreshData}
                    />
                  </>
                )}
                <Button variant="outline" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardStats
              title="Tarefas Ativas"
              value={activeTasks}
              description={`${tasks.length} total`}
              icon={ListTodo}
            />
            <DashboardStats
              title="Concluídas"
              value={completedToday}
              icon={CheckCircle2}
              variant="success"
            />
            <DashboardStats
              title="Colaboradores"
              value={teams.reduce(
                (sum, t) => sum + (t.team_members?.length || 0),
                0
              )}
              description={`${teams.length} equipas`}
              icon={Users}
            />
            <DashboardStats
              title="Pontos Totais"
              value={totalPoints}
              icon={Trophy}
              variant="accent"
            />
          </div>

          <Tabs defaultValue="tasks" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="tasks" className="gap-2">
                <ListTodo className="w-4 h-4" />
                Tarefas
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="teams" className="gap-2">
                  <Users className="w-4 h-4" />
                  Equipas
                </TabsTrigger>
              )}
              <TabsTrigger value="ranking" className="gap-2">
                <Medal className="w-4 h-4" />
                Ranking
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tasks" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Tarefas Recentes</h2>
              </div>
              {tasks.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      id={task.id}
                      title={task.title}
                      description={task.description || ""}
                      assignee={task.profiles?.full_name || "Não atribuído"}
                      deadline={
                        task.deadline
                          ? new Date(task.deadline).toLocaleDateString("pt-PT")
                          : "Sem prazo"
                      }
                      status={task.status}
                      points={task.points}
                      onComplete={handleCompleteTask}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ListTodo className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    Ainda não há tarefas criadas
                  </p>
                  {isAdmin && (
                    <p className="text-sm text-muted-foreground">
                      Clique em "Nova Tarefa" para começar
                    </p>
                  )}
                </div>
              )}
            </TabsContent>

            {isAdmin && (
              <TabsContent value="teams" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Equipas de Trabalho</h2>
                  <CreateTeamDialog
                    companyId={companyId}
                    onCreateTeam={refreshData}
                  />
                </div>
                {teams.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {teams.map((team) => (
                      <TeamCard
                        key={team.id}
                        id={team.id}
                        name={team.name}
                        members={
                          team.team_members?.map((tm: any) => ({
                            id: tm.profiles.id,
                            name: tm.profiles.full_name,
                            points: tm.profiles.points,
                          })) || []
                        }
                        tasksCompleted={0}
                        totalPoints={
                          team.team_members?.reduce(
                            (sum: number, tm: any) => sum + (tm.profiles.points || 0),
                            0
                          ) || 0
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Ainda não há equipas criadas
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Clique em "Nova Equipa" para começar
                    </p>
                  </div>
                )}
              </TabsContent>
            )}

            <TabsContent value="ranking" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Ranking de Pontos</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/leaderboard")}
                >
                  Ver Completo
                </Button>
              </div>
              <div className="max-w-3xl">
                <p className="text-center text-muted-foreground py-8">
                  Acesse o ranking completo para ver a classificação
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
}
