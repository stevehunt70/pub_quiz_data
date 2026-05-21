import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Sparkles, History, Search, Music2, FileText, CheckCircle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StatsCard from '@/components/dashboard/StatsCard';
import RecentSessions from '@/components/dashboard/RecentSessions';

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser);
  }, []);

  const { data: sessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.QuizSession.list('-created_date', 50),
    initialData: [],
  });

  const { data: usedQuestions } = useQuery({
    queryKey: ['usedQuestions'],
    queryFn: () => base44.entities.UsedQuestion.list('-created_date', 500),
    initialData: [],
  });

  const { data: allQuestions } = useQuery({
    queryKey: ['allQuestions'],
    queryFn: () => base44.entities.QuizQuestion.list('-created_date', 500),
    initialData: [],
  });

  const totalQuizzes = sessions.length;
  const totalUsed = usedQuestions.length;
  const totalAvailable = allQuestions.length;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">
          Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-muted-foreground mt-1">Your music pub quiz command centre</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/generate" className="block">
          <Card className="bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20 hover:border-primary/40 transition-all cursor-pointer p-5">
            <CardContent className="p-0 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-heading font-semibold text-foreground">Generate Quiz</p>
                <p className="text-xs text-muted-foreground">Create new questions</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/history" className="block">
          <Card className="bg-gradient-to-br from-accent/20 to-accent/5 border-accent/20 hover:border-accent/40 transition-all cursor-pointer p-5">
            <CardContent className="p-0 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                <History className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="font-heading font-semibold text-foreground">Quiz History</p>
                <p className="text-xs text-muted-foreground">View past sessions</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link to="/artist-lookup" className="block">
          <Card className="bg-card border-border hover:border-primary/30 transition-all cursor-pointer p-5">
            <CardContent className="p-0 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-heading font-semibold text-foreground">Artist Lookup</p>
                <p className="text-xs text-muted-foreground">Search UK chart entries</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard icon={FileText} label="Quizzes Created" value={totalQuizzes} />
        <StatsCard icon={CheckCircle} label="Questions Used" value={totalUsed} color="text-accent" />
        <StatsCard icon={BarChart3} label="Questions Available" value={totalAvailable} color="text-green-400" />
      </div>

      {/* Recent sessions */}
      <RecentSessions sessions={sessions} />
    </div>
  );
}