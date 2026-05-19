import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter } from 'lucide-react';

const decades = ['Any', '1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
const difficulties = ['Any', 'Easy', 'Medium', 'Hard'];
const questionTypes = [
  { value: 'any', label: 'Any Type' },
  { value: 'artist_from_song', label: 'Name the Artist' },
  { value: 'song_from_artist', label: 'Name the Song' },
  { value: 'year_question', label: 'Guess the Year' },
  { value: 'lyrics_question', label: 'Lyrics Round' },
  { value: 'one_hit_wonder', label: 'One-Hit Wonders' },
  { value: 'connection', label: 'Connection Round' },
  { value: 'intro_round', label: 'Intro Round' },
];
const peakPositions = [
  { value: '0', label: 'Any Position' },
  { value: '1', label: 'No. 1 Only' },
  { value: '5', label: 'Top 5' },
  { value: '10', label: 'Top 10' },
  { value: '20', label: 'Top 20' },
  { value: '40', label: 'Top 40' },
  { value: '75', label: 'Top 75' },
];

export default function QuizFilters({ filters, onChange }) {
  const update = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="font-heading text-lg flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Artist</Label>
          <Input
            placeholder="e.g. Oasis, Adele..."
            value={filters.artist || ''}
            onChange={e => update('artist', e.target.value)}
            className="bg-secondary border-border"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Decade</Label>
          <Select value={filters.decade || 'Any'} onValueChange={v => update('decade', v)}>
            <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              {decades.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Specific Year</Label>
          <Input
            type="number"
            placeholder="e.g. 1985"
            value={filters.year || ''}
            onChange={e => update('year', e.target.value)}
            className="bg-secondary border-border"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Difficulty</Label>
          <Select value={filters.difficulty || 'Any'} onValueChange={v => update('difficulty', v)}>
            <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              {difficulties.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Question Type</Label>
          <Select value={filters.questionType || 'any'} onValueChange={v => update('questionType', v)}>
            <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              {questionTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">Peak Chart Position</Label>
          <Select value={filters.peakPosition || '0'} onValueChange={v => update('peakPosition', v)}>
            <SelectTrigger className="bg-secondary border-border"><SelectValue /></SelectTrigger>
            <SelectContent>
              {peakPositions.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
          <Label className="text-xs text-muted-foreground uppercase tracking-wider">
            Number of Questions: {filters.count || 10}
          </Label>
          <Slider
            value={[filters.count || 10]}
            onValueChange={([v]) => update('count', v)}
            min={5}
            max={30}
            step={5}
            className="mt-3"
          />
        </div>
      </CardContent>
    </Card>
  );
}