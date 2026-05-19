import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { useState } from 'react';

const difficultyColors = {
  Easy: 'bg-green-500/15 text-green-400 border-green-500/20',
  Medium: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  Hard: 'bg-red-500/15 text-red-400 border-red-500/20',
};

const typeLabels = {
  artist_from_song: 'Name the Artist',
  song_from_artist: 'Name the Song',
  year_question: 'Guess the Year',
  lyrics_question: 'Lyrics',
  one_hit_wonder: 'One-Hit Wonder',
  connection: 'Connection',
  guess_the_year: 'Guess the Year',
  intro_round: 'Intro Round',
};

export default function QuestionCard({ question, index, onRemove }) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <Card className="p-4 bg-card border-border hover:border-primary/20 transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-heading font-bold text-primary shrink-0">
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground leading-relaxed">{question.question_text}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {question.difficulty && (
                <Badge variant="outline" className={difficultyColors[question.difficulty] || ''}>
                  {question.difficulty}
                </Badge>
              )}
              {question.question_type && (
                <Badge variant="outline" className="border-border text-muted-foreground">
                  {typeLabels[question.question_type] || question.question_type}
                </Badge>
              )}
              {question.artist && (
                <Badge variant="outline" className="border-border text-muted-foreground">
                  {question.artist}
                </Badge>
              )}
              {question.year && (
                <Badge variant="outline" className="border-border text-muted-foreground">
                  {question.year}
                </Badge>
              )}
              {question.peak_position && (
                <Badge variant="outline" className="border-primary/30 text-primary">
                  #{question.peak_position}
                </Badge>
              )}
            </div>
            {showAnswer && (
              <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm text-primary font-medium">Answer: {question.answer}</p>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => setShowAnswer(!showAnswer)}
          >
            {showAnswer ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          {onRemove && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={onRemove}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}