import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Loader2, ArrowUpDown, Music2, TrendingUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function ArtistLookup() {
  const [artistName, setArtistName] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('year');
  const [sortDir, setSortDir] = useState('asc');

  const handleSearch = async () => {
    if (!artistName.trim()) return;
    setLoading(true);
    setResults(null);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `List all UK chart entries for the artist "${artistName}". 
For each entry, provide:
- Song title
- Year of chart entry
- Highest UK chart position reached
- Number of weeks on the chart (if known, otherwise estimate)
- Any notable facts (e.g. "Christmas number one", "debut single", "posthumous release")

Be as comprehensive and accurate as possible. Include all known singles that charted in the UK Official Singles Chart.
If the artist has never charted in the UK, say so clearly.`,
      response_json_schema: {
        type: "object",
        properties: {
          artist_name: { type: "string" },
          total_chart_entries: { type: "number" },
          number_one_hits: { type: "number" },
          top_ten_hits: { type: "number" },
          career_span: { type: "string" },
          entries: {
            type: "array",
            items: {
              type: "object",
              properties: {
                song_title: { type: "string" },
                year: { type: "number" },
                peak_position: { type: "number" },
                weeks_on_chart: { type: "number" },
                notable_fact: { type: "string" }
              }
            }
          },
          no_results: { type: "boolean" }
        }
      },
      add_context_from_internet: true,
    });

    setResults(result);
    setLoading(false);
  };

  const sortedEntries = results?.entries ? [...results.entries].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'year') comparison = (a.year || 0) - (b.year || 0);
    else if (sortBy === 'position') comparison = (a.peak_position || 999) - (b.peak_position || 999);
    else if (sortBy === 'weeks') comparison = (b.weeks_on_chart || 0) - (a.weeks_on_chart || 0);
    else if (sortBy === 'title') comparison = (a.song_title || '').localeCompare(b.song_title || '');
    return sortDir === 'desc' ? -comparison : comparison;
  }) : [];

  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('asc');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">Artist Lookup</h1>
        <p className="text-muted-foreground mt-1">Search any artist's UK chart history — not stored, just for reference</p>
      </div>

      <Card className="bg-card border-border">
        <CardContent className="p-5">
          <div className="flex gap-3">
            <Input
              placeholder="Search for an artist e.g. Oasis, Adele, The Beatles..."
              value={artistName}
              onChange={e => setArtistName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              className="bg-secondary border-border flex-1"
            />
            <Button onClick={handleSearch} disabled={loading || !artistName.trim()} className="gap-2 shrink-0">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <Search className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground font-medium">Searching UK chart history...</p>
        </div>
      )}

      {results && !results.no_results && (
        <div className="space-y-4">
          {/* Artist summary */}
          <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Music2 className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-heading font-bold text-foreground">{results.artist_name}</h2>
                  <p className="text-sm text-muted-foreground">{results.career_span}</p>
                </div>
                <div className="flex gap-4 ml-auto">
                  <div className="text-center">
                    <p className="text-2xl font-heading font-bold text-foreground">{results.total_chart_entries}</p>
                    <p className="text-xs text-muted-foreground">Chart Entries</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-heading font-bold text-primary">{results.number_one_hits}</p>
                    <p className="text-xs text-muted-foreground">No. 1 Hits</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-heading font-bold text-accent">{results.top_ten_hits}</p>
                    <p className="text-xs text-muted-foreground">Top 10 Hits</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sort controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32 bg-secondary border-border h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="year">Year</SelectItem>
                <SelectItem value="position">Chart Position</SelectItem>
                <SelectItem value="weeks">Weeks on Chart</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}>
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>

          {/* Results table */}
          <Card className="bg-card border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('title')}>Song Title</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('year')}>Year</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('position')}>Peak</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => toggleSort('weeks')}>Weeks</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedEntries.map((entry, i) => (
                    <TableRow key={i} className="hover:bg-secondary/30">
                      <TableCell className="font-medium">{entry.song_title}</TableCell>
                      <TableCell>{entry.year}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            entry.peak_position === 1 ? 'bg-primary/15 text-primary border-primary/30' :
                            entry.peak_position <= 10 ? 'bg-accent/15 text-accent border-accent/30' :
                            'border-border text-muted-foreground'
                          }
                        >
                          #{entry.peak_position}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{entry.weeks_on_chart || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{entry.notable_fact || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      )}

      {results?.no_results && (
        <Card className="bg-card border-border">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Music2 className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="font-heading font-semibold text-foreground mb-1">No UK chart entries found</h3>
            <p className="text-sm text-muted-foreground">Try a different spelling or check the artist name</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}