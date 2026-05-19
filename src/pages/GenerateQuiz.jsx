import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2, Save, Download, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import QuizFilters from '@/components/generate/QuizFilters';
import QuestionCard from '@/components/generate/QuestionCard';
import SaveQuizDialog from '@/components/generate/SaveQuizDialog';

function buildPrompt(filters, usedQuestionTexts) {
  let prompt = `You are a professional pub quiz question writer specialising in UK music chart history.
Generate exactly ${filters.count || 10} unique music quiz questions suitable for a British pub quiz.

IMPORTANT RULES:
- Each question must be factual and based on real UK chart data
- Questions should be fun and engaging for pub quiz audiences
- Vary the question styles within the selected type
- Include the artist, song title, year, decade, peak UK chart position, and difficulty for each question
`;

  if (filters.artist && filters.artist.trim()) {
    prompt += `\n- Focus on the artist: ${filters.artist}`;
  }
  if (filters.decade && filters.decade !== 'Any') {
    prompt += `\n- Questions should be about songs from the ${filters.decade}`;
  }
  if (filters.year) {
    prompt += `\n- Questions should be about songs from ${filters.year}`;
  }
  if (filters.difficulty && filters.difficulty !== 'Any') {
    prompt += `\n- All questions should be ${filters.difficulty} difficulty`;
  }
  if (filters.questionType && filters.questionType !== 'any') {
    const typeDescriptions = {
      artist_from_song: 'Ask "Who had a hit with [song]?" style questions',
      song_from_artist: 'Ask "What was the name of [artist]\'s hit that...?" style questions',
      year_question: 'Ask "In what year did [song] reach the charts?" style questions',
      lyrics_question: 'Give a lyric snippet and ask what song or artist it belongs to',
      one_hit_wonder: 'Focus on one-hit wonders - artists who had only one notable UK chart hit',
      connection: 'Create questions where several songs/artists share a hidden connection the teams must figure out',
      intro_round: 'Describe the opening bars/intro of famous songs for teams to identify',
    };
    prompt += `\n- Question type: ${typeDescriptions[filters.questionType] || filters.questionType}`;
  }
  if (filters.peakPosition && filters.peakPosition !== '0') {
    prompt += `\n- Only include songs that reached the Top ${filters.peakPosition} in the UK charts`;
  }

  if (usedQuestionTexts && usedQuestionTexts.length > 0) {
    const recentUsed = usedQuestionTexts.slice(0, 100);
    prompt += `\n\nIMPORTANT: Do NOT generate questions about any of these songs/topics that have already been used:\n${recentUsed.join('\n')}`;
  }

  return prompt;
}

export default function GenerateQuiz() {
  const [filters, setFilters] = useState({
    artist: '', decade: 'Any', year: '', difficulty: 'Any',
    questionType: 'any', peakPosition: '0', count: 10
  });
  const [questions, setQuestions] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showAllAnswers, setShowAllAnswers] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: usedQuestions } = useQuery({
    queryKey: ['usedQuestions'],
    queryFn: () => base44.entities.UsedQuestion.list('-created_date', 500),
    initialData: [],
  });

  const { data: existingQuestions } = useQuery({
    queryKey: ['allQuestions'],
    queryFn: () => base44.entities.QuizQuestion.list('-created_date', 500),
    initialData: [],
  });

  const usedQuestionIds = new Set(usedQuestions.map(u => u.question_id));
  const usedQuestionTexts = existingQuestions
    .filter(q => usedQuestionIds.has(q.id))
    .map(q => `${q.artist} - ${q.song_title}`);

  const handleGenerate = async () => {
    setGenerating(true);
    setQuestions([]);
    const prompt = buildPrompt(filters, usedQuestionTexts);

    const schema = {
      type: "object",
      properties: {
        questions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              question_text: { type: "string" },
              answer: { type: "string" },
              artist: { type: "string" },
              song_title: { type: "string" },
              year: { type: "number" },
              decade: { type: "string" },
              difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
              peak_position: { type: "number" },
              question_type: { type: "string" },
            }
          }
        }
      }
    };

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: schema,
      add_context_from_internet: true,
    });

    setQuestions(result.questions || []);
    setGenerating(false);
  };

  const handleRemoveQuestion = (idx) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async ({ session_name, quiz_date, notes }) => {
    setIsSaving(true);

    // Save questions to entity
    const savedQuestions = await base44.entities.QuizQuestion.bulkCreate(
      questions.map(q => ({
        question_text: q.question_text,
        answer: q.answer,
        artist: q.artist,
        song_title: q.song_title,
        year: q.year,
        decade: q.decade,
        difficulty: q.difficulty,
        peak_position: q.peak_position,
        question_type: q.question_type || filters.questionType,
      }))
    );

    const questionIds = savedQuestions.map(q => q.id);

    // Create session
    await base44.entities.QuizSession.create({
      session_name,
      quiz_date,
      question_ids: questionIds,
      question_count: questionIds.length,
      filters_used: filters,
      status: 'draft',
      notes,
    });

    // Mark as used
    await base44.entities.UsedQuestion.bulkCreate(
      questionIds.map(id => ({
        question_id: id,
        used_date: quiz_date,
      }))
    );

    queryClient.invalidateQueries({ queryKey: ['sessions'] });
    queryClient.invalidateQueries({ queryKey: ['usedQuestions'] });
    queryClient.invalidateQueries({ queryKey: ['allQuestions'] });

    setIsSaving(false);
    setShowSaveDialog(false);
    toast({ title: 'Quiz saved!', description: `${questionIds.length} questions saved and marked as used.` });
    setQuestions([]);
  };

  const handleDownload = () => {
    let text = `MUSIC PUB QUIZ\n${'='.repeat(40)}\n\nQUESTIONS\n${'-'.repeat(40)}\n\n`;
    questions.forEach((q, i) => {
      text += `${i + 1}. ${q.question_text}\n`;
      if (q.difficulty) text += `   [${q.difficulty}]`;
      if (q.peak_position) text += ` [UK #${q.peak_position}]`;
      text += '\n\n';
    });
    text += `\nANSWERS\n${'-'.repeat(40)}\n\n`;
    questions.forEach((q, i) => {
      text += `${i + 1}. ${q.answer}`;
      if (q.artist && q.song_title) text += ` (${q.artist} - ${q.song_title}, ${q.year || ''})`;
      text += '\n';
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `music-quiz-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Generate Quiz</h1>
        <p className="text-muted-foreground mt-1">Create unique music questions using AI — filtered to your preferences</p>
      </div>

      <QuizFilters filters={filters} onChange={setFilters} />

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleGenerate} disabled={generating} className="gap-2">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? 'Generating...' : 'Generate Questions'}
        </Button>
        {questions.length > 0 && (
          <>
            <Button variant="outline" onClick={() => setShowSaveDialog(true)} className="gap-2">
              <Save className="w-4 h-4" /> Save Quiz
            </Button>
            <Button variant="outline" onClick={handleDownload} className="gap-2">
              <Download className="w-4 h-4" /> Download
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowAllAnswers(!showAllAnswers)}
              className="gap-2 text-muted-foreground"
            >
              {showAllAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showAllAnswers ? 'Hide Answers' : 'Show Answers'}
            </Button>
          </>
        )}
      </div>

      {generating && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground font-medium">Crafting your questions...</p>
          <p className="text-xs text-muted-foreground">This may take a few seconds</p>
        </div>
      )}

      {questions.length > 0 && !generating && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{questions.length} questions generated</p>
          {questions.map((q, i) => (
            <QuestionCard
              key={i}
              question={q}
              index={i}
              onRemove={() => handleRemoveQuestion(i)}
            />
          ))}
        </div>
      )}

      <SaveQuizDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        onSave={handleSave}
        questionCount={questions.length}
        isSaving={isSaving}
      />
    </div>
  );
}