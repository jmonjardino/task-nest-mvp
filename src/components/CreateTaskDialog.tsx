import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().trim().min(1, "Título é obrigatório").max(200, "Título deve ter no máximo 200 caracteres"),
  description: z.string().trim().max(2000, "Descrição deve ter no máximo 2000 caracteres").optional(),
  points: z.number().int().min(0, "Pontos devem ser positivos").max(1000, "Pontos devem ser no máximo 1000"),
  assignee_id: z.string().uuid("Selecione um colaborador válido"),
  deadline: z.string().min(1, "Prazo é obrigatório"),
});

interface Collaborator {
  id: string;
  full_name: string;
}

interface CreateTaskDialogProps {
  onCreateTask: () => void;
  companyId: string;
}

export function CreateTaskDialog({ onCreateTask, companyId }: CreateTaskDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [deadline, setDeadline] = useState("");
  const [points, setPoints] = useState("100");

  useEffect(() => {
    if (open) {
      loadCollaborators();
    }
  }, [open, companyId]);

  const loadCollaborators = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("company_id", companyId)
        .order("full_name");

      if (error) throw error;
      setCollaborators(data || []);
    } catch (error) {
      console.error("Error loading collaborators:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate input with Zod
      const validated = taskSchema.parse({
        title,
        description: description || undefined,
        points: parseInt(points),
        assignee_id: assigneeId,
        deadline,
      });

      const currentUser = (await supabase.auth.getUser()).data.user;
      
      const { error } = await supabase.from("tasks").insert({
        company_id: companyId,
        title: validated.title,
        description: validated.description || null,
        assignee_id: validated.assignee_id,
        deadline: new Date(validated.deadline).toISOString(),
        points: validated.points,
        status: "pending",
        created_by: currentUser?.id,
      });

      if (error) throw error;

      toast.success("Tarefa criada com sucesso!");
      onCreateTask();
      setOpen(false);
      setTitle("");
      setDescription("");
      setAssigneeId("");
      setDeadline("");
      setPoints("100");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Erro ao criar tarefa");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Tarefa
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Tarefa</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Organizar Armazém Zona A"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva a tarefa..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="assignee">Atribuir a *</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um colaborador" />
              </SelectTrigger>
              <SelectContent>
                {collaborators.map((collab) => (
                  <SelectItem key={collab.id} value={collab.id}>
                    {collab.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">Prazo *</Label>
              <Input
                id="deadline"
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Pontos</Label>
              <Input
                id="points"
                type="number"
                min="50"
                max="500"
                step="50"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Tarefa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
