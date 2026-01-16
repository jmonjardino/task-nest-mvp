import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Plus, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface InviteCode {
  id: string;
  code: string;
  created_at: string;
}

interface Props {
  companyId: string;
  existingCodes: InviteCode[];
  onCodeCreated: () => void;
}

export function InviteCodeDialog({ companyId, existingCodes, onCodeCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateCode = async () => {
    setLoading(true);
    try {
      const newCode = generateCode();
      
      const { error } = await supabase
        .from("company_invitations")
        .insert({
          company_id: companyId,
          code: newCode,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;

      toast.success("Código de convite criado!");
      onCodeCreated();
    } catch (error: any) {
      toast.error("Erro ao criar código de convite");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Código copiado!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteCode = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('company_invitations')
        .delete()
        .eq('id', inviteId);
      
      if (error) throw error;
      toast.success('Código revogado com sucesso');
      onCodeCreated();
    } catch (error) {
      toast.error('Erro ao revogar código');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Códigos de Convite
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Códigos de Convite</DialogTitle>
          <DialogDescription>
            Gere códigos para convidar colaboradores para a sua empresa
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button onClick={handleCreateCode} disabled={loading} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Gerar Novo Código
          </Button>

          {existingCodes.length > 0 && (
            <div className="space-y-2">
              <Label>Códigos Existentes</Label>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {existingCodes.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between p-3 border rounded-lg gap-2"
                  >
                    <div className="flex-1">
                      <Input
                        value={invite.code}
                        readOnly
                        className="font-mono text-lg font-bold"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(invite.code, invite.id)}
                    >
                      {copiedId === invite.id ? (
                        <Check className="w-4 h-4 text-success" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCode(invite.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
