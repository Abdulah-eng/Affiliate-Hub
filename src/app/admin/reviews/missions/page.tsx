import { adminGetPendingTaskSubmissions, adminReviewTaskProgress } from "@/app/actions/tasks";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  Trophy, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  User, 
  FileText,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import MissionReviewClient from "./MissionReviewClient";

export const dynamic = 'force-dynamic';

export default async function MissionReviewPage() {
  const submissions = await adminGetPendingTaskSubmissions();

  return (
    <div className="animate-vapor">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface">
          Mission <span className="text-primary">Audits</span>
        </h1>
        <p className="text-on-surface-variant max-w-xl text-lg font-medium mt-2">
          Verify screenshot evidence for complex challenges and unscramble missions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <GlassCard className="p-4 flex items-center gap-4 bg-surface-container-low/40">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Pending Verification</p>
            <p className="text-2xl font-black text-on-surface">{submissions.length}</p>
          </div>
        </GlassCard>
      </div>

      <MissionReviewClient initialSubmissions={submissions} />
    </div>
  );
}
