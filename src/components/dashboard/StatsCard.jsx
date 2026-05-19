import { Card } from '@/components/ui/card';

export default function StatsCard({ icon: Icon, label, value, color = 'text-primary' }) {
  return (
    <Card className="p-5 bg-card border-border hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
        </div>
      </div>
    </Card>
  );
}