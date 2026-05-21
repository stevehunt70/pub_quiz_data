// src/pages/QuizHistory.jsx
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, ChevronDown, ChevronUp, Download, Trash2, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import QuestionCard from '@/components/generate/QuestionCard';
import { api } from '@/api/client';

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  finalized: 'bg-primary/15 text-primary',
  used: 'bg-accent/15 text-accent',
};

export default function QuizHistory() {
  const [expandedId, setExpandedId] = useState(null);
  const [sessionQuestions, setSessionQuestions] = useState({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => api.get('/sessions'),
  });

  const { data: allQuestions = [] } = useQuery({
    queryKey: ['allQuestions'],
    queryFn: () => api.get('/questions'),
  });

  const toggleExpand = (sessionId) => {
    if (expandedId === sessionId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(sessionId);
    const session = sessions.find((s) => s.id === sessionId);
    if (session?.question_ids) {
      const qMap = {};
      allQuestions.forEach((q) => {
        qMap[q.id] = q;
      });
      const qs = session.question_ids.map((id) => qMap[id]).filter(Boolean);
      setSessionQuestions((prev) => ({ ...prev, [sessionId]: qs }));
    }
  };

  const handleStatusChange = async (session, newStatus) => {
    await api.patch(`/sessions/${session.id}`, { status: newStatus });
    queryClient.invalidateQueries({ queryKey: ['sessions'] });
    toast({ title: `Quiz marked as ${newStatus}` });
  };

  const handleDelete = async (session) => {
    await api.delete(`/sessions/${session.id}`);
    queryClient.invalidateQueries({ queryKey: ['sessions'] });
    toast({ title: 'Quiz deleted' });
  };

  const handleDownload = (session) => {
    const qs = sessionQuestions[session.id] || [];
    let text = `${session.session_name}\nDate: ${
      session.quiz_date ? format(new Date(session.quiz_date), 'dd MMMM yyyy') : 'N/A'
    }\n${'='.repeat(40)}\n\nQUESTIONS\n${'-'.repeat(40)}\n\n`;
    qs.forEach((q, i) => {
      text += `${i + 1}. ${q.question_text}\n\n`;
    });
    text += `\nANSWERS\n${'-'.repeat(40)}\n\n`;
    qs.forEach((q, i) => {
      text += `${i + 1}. ${q.answer}\n`;
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${session.session_name.replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Quiz History</h1>
        <p className="text-muted-foreground mt-1">All your past quiz sessions — view, download, or manage</p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      )}

      {!isLoading && sessions.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-heading font-semibold text-foreground mb-1">No quizzes yet</h3>
            <p className="text-sm text-muted-foreground">Generate your first quiz to see it here</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {sessions.map((session) => (
          <Card key={session.id} className="bg-card border-border overflow-hidden">
            <div
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
              onClick={() => toggleExpand(session.id)}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{session.session_name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <Calendar className="w-3 h-3" />
                    {session.quiz_date ? format(new Date(session.quiz_date), 'dd MMM yyyy') : 'No date'}
                    <span>·</span>
                    <span>{session.question_count || 0} questions</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={statusColors[session.status] || statusColors.draft}>{session.status}</Badge>
                {expandedId === session.id ? (
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>

            {expandedId === session.id && (
              <div className="border-t border-border p-4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Select value={session.status} onValueChange={(v) => handleStatusChange(session, v)}>
                    <SelectTrigger className="w-32 bg-secondary border-border h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="finalized">Finalized</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => handleDownload(session)} className="gap-2">
                    <Download className="w-3.5 h-3.5" /> Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(session)}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </Button>
                </div>

                {session.notes && <p className="text-sm text-muted-foreground italic">{session.notes}</p>}

                <div className="space-y-2">
                  {(sessionQuestions[session.id] || []).map((q, i) => (
                    <QuestionCard key={q.id} question={q} index={i} />
                  ))}
                  {(!sessionQuestions[session.id] || sessionQuestions[session.id].length === 0) && (
                    <p className="text-sm text-muted-foreground text-center py-4">Loading questions...</p>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}