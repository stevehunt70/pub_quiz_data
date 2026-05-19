import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  finalized: 'bg-primary/15 text-primary',
  used: 'bg-accent/15 text-accent',
};

export default function RecentSessions({ sessions }) {
  if (!sessions || sessions.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Recent Quizzes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-8">
            No quizzes generated yet. Head to Generate Quiz to create your first one!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-heading text-lg">Recent Quizzes</CardTitle>
        <Link to="/history" className="text-sm text-primary hover:underline">View all</Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.slice(0, 5).map(session => (
          <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{session.session_name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {session.quiz_date ? format(new Date(session.quiz_date), 'dd MMM yyyy') : 'No date'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{session.question_count || 0} Qs</span>
              <Badge className={statusColors[session.status] || statusColors.draft}>
                {session.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}