import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";

interface Member {
  id: string;
  full_name: string;
}

interface CreateTeamDialogProps {
  onCreateTeam: () => void;
  companyId: string;
}

export function CreateTeamDialog({ onCreateTeam, companyId }: CreateTeamDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableMembers, setAvailableMembers] = useState<Member[]>([]);
  const [teamName, setTeamName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      loadMembers();
    }
  }, [open, companyId]);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("company_id", companyId)
        .order("full_name");

      if (error) throw error;
      setAvailableMembers(data || []);
    } catch (error) {
      console.error("Error loading members:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMembers.length === 0) {
      toast.error("Selecione pelo menos um membro");
      return;
    }

    setLoading(true);
    try {
      // Create team
      const { data: teamData, error: teamError } = await supabase
        .from("teams")
        .insert({
          company_id: companyId,
          name: teamName,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add team members
      const memberInserts = selectedMembers.map((memberId) => ({
        team_id: teamData.id,
        user_id: memberId,
      }));

      const { error: membersError } = await supabase
        .from("team_members")
        .insert(memberInserts);

      if (membersError) throw membersError;

      toast.success("Equipa criada com sucesso!");
      onCreateTeam();
      setOpen(false);
      setTeamName("");
      setSelectedMembers([]);
    } catch (error: any) {
      toast.error("Erro ao criar equipa");
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Equipa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Criar Nova Equipa
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Nome da Equipa *</Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Ex: Equipa Armazém A"
              required
            />
          </div>

          <div className="space-y-3">
            <Label>Selecionar Membros * ({selectedMembers.length} selecionados)</Label>
            <div className="border rounded-lg p-3 max-h-[300px] overflow-y-auto space-y-2">
              {availableMembers.map((member) => (
                <div key={member.id} className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md">
                  <Checkbox
                    id={member.id}
                    checked={selectedMembers.includes(member.id)}
                    onCheckedChange={() => toggleMember(member.id)}
                  />
                  <label
                    htmlFor={member.id}
                    className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {member.full_name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Equipa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
