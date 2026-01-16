import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX, Users } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface PendingMember {
  id: string;
  user_id: string;
  status: string;
  invited_at: string;
  profiles: {
    full_name: string;
  };
}

interface Props {
  pendingMembers: PendingMember[];
  onMemberUpdated: () => void;
}

export function PendingMembersDialog({ pendingMembers, onMemberUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleApprove = async (memberId: string, userId: string, companyId: string) => {
    setLoading(memberId);
    try {
      console.log('[DEBUG] Approving member:', { memberId, userId, companyId });

      const currentUser = (await supabase.auth.getUser()).data.user;

      // Update member status
      const { error: memberError } = await supabase
        .from("company_members")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: currentUser?.id,
        })
        .eq("id", memberId);

      console.log('[DEBUG] Member status update result:', { error: memberError });
      if (memberError) throw memberError;

      // Update profile with company_id
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ company_id: companyId })
        .eq("id", userId);

      console.log('[DEBUG] Profile update result:', {
        error: profileError,
        userId,
        companyId
      });
      if (profileError) throw profileError;

      toast.success("Membro aprovado com sucesso!");
      onMemberUpdated();
    } catch (error: any) {
      console.error('[DEBUG] Error approving member:', error);
      toast.error("Erro ao aprovar membro");
    } finally {
      setLoading(null);
    }
  };

  const handleReject = async (memberId: string) => {
    setLoading(memberId);
    try {
      const { error } = await supabase
        .from("company_members")
        .update({ status: "rejected" })
        .eq("id", memberId);

      if (error) throw error;

      toast.success("Pedido rejeitado");
      onMemberUpdated();
    } catch (error: any) {
      toast.error("Erro ao rejeitar pedido");
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Users className="w-4 h-4 mr-2" />
          Pedidos Pendentes
          {pendingMembers.length > 0 && (
            <Badge variant="destructive" className="ml-2 px-2 py-0.5 text-xs">
              {pendingMembers.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pedidos de Entrada Pendentes</DialogTitle>
          <DialogDescription>
            Aprove ou rejeite colaboradores que solicitaram entrada na empresa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {pendingMembers.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Não há pedidos pendentes
            </p>
          ) : (
            pendingMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <p className="font-semibold">{member.profiles.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Solicitado em {new Date(member.invited_at).toLocaleDateString("pt-PT")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => {
                      // Get company_id from the member record
                      supabase
                        .from("company_members")
                        .select("company_id")
                        .eq("id", member.id)
                        .single()
                        .then(({ data }) => {
                          if (data) {
                            handleApprove(member.id, member.user_id, data.company_id);
                          }
                        });
                    }}
                    disabled={loading === member.id}
                  >
                    <UserCheck className="w-4 h-4 mr-1" />
                    Aprovar
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleReject(member.id)}
                    disabled={loading === member.id}
                  >
                    <UserX className="w-4 h-4 mr-1" />
                    Rejeitar
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
