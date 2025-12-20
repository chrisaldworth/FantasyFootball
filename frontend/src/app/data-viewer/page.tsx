'use client';

import { useState, useEffect } from 'react';
import TopNavigation from '@/components/navigation/TopNavigation';
import { useSidebar } from '@/lib/sidebar-context';

interface MatchData {
  season: string;
  week: string;
  date: string;
  home_team: string;
  away_team: string;
  home_score: string;
  away_score: string;
  attendance?: string;
  referee?: string;
  result?: string;
  match_report_url?: string;
  home_scorers?: string;
  away_scorers?: string;
  home_assists?: string;
  away_assists?: string;
  home_cards?: string;
  away_cards?: string;
}

export default function DataViewerPage() {
  const { isExpanded } = useSidebar();
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('2023-2024');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'week' | 'home_team' | 'away_team'>('date');

  useEffect(() => {
    loadData(selectedSeason);
  }, [selectedSeason]);

  const loadData = async (season: string) => {
    setLoading(true);
    setError('');
    try {
      // Load CSV from public directory
      const seasonFile = season.replace('-', '_');
      const csvPath = `/data/pl_results_${seasonFile}.csv`;
      
      // Try detailed version first
      let response = await fetch(`${csvPath.replace('.csv', '_detailed.csv')}`);
      if (!response.ok) {
        // Fallback to regular version
        response = await fetch(csvPath);
      }
      
      if (!response.ok) {
        throw new Error(`CSV file not found for season ${season}`);
      }
      
      const csvText = await response.text();
      const data = parseCSV(csvText);
      setMatches(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load match data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const parseCSV = (csvContent: string): MatchData[] => {
    const lines = csvContent.trim().split('\n');
    if (lines.length === 0) return [];

    // Parse header
    const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
    
    // Parse data rows
    const records: MatchData[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Simple CSV parsing (handles quoted fields)
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim()); // Add last value

      // Create record object
      const record: any = {};
      headers.forEach((header, idx) => {
        let value = values[idx] || '';
        // Remove surrounding quotes if present
        value = value.replace(/^"|"$/g, '');
        record[header] = value;
      });
      records.push(record as MatchData);
    }

    return records;
  };

  const filteredAndSortedMatches = matches
    .filter(match => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        match.home_team?.toLowerCase().includes(term) ||
        match.away_team?.toLowerCase().includes(term) ||
        match.home_scorers?.toLowerCase().includes(term) ||
        match.away_scorers?.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date || '').getTime() - new Date(b.date || '').getTime();
        case 'week':
          return parseInt(a.week || '0') - parseInt(b.week || '0');
        case 'home_team':
          return (a.home_team || '').localeCompare(b.home_team || '');
        case 'away_team':
          return (a.away_team || '').localeCompare(b.away_team || '');
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-[var(--pl-dark)]">
      <TopNavigation
        pageTitle="Premier League Data Viewer"
        showFavoriteTeam={true}
        showNotifications={true}
        showLinkFPL={true}
      />
      
      <main className={`pt-20 sm:pt-20 lg:pt-20 pb-20 lg:pb-12 px-4 sm:px-6 transition-all duration-300 ${
        isExpanded ? 'lg:pl-60' : 'lg:pl-16'
      }`}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-[var(--pl-green)]">
            Premier League Match Data Viewer
          </h1>

          {/* Controls */}
          <div className="glass rounded-xl p-4 mb-6 flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-[var(--pl-text-muted)]">Season:</label>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[var(--pl-card)] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)]"
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
              </select>
            </div>

            <div className="flex items-center gap-2 flex-1">
              <label className="text-sm font-medium text-[var(--pl-text-muted)]">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search teams, players..."
                className="flex-1 px-3 py-2 rounded-lg bg-[var(--pl-card)] border border-white/10 text-white placeholder-[var(--pl-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)]"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-[var(--pl-text-muted)]">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-lg bg-[var(--pl-card)] border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)]"
              >
                <option value="date">Date</option>
                <option value="week">Week</option>
                <option value="home_team">Home Team</option>
                <option value="away_team">Away Team</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="glass rounded-xl p-4">
              <div className="text-sm text-[var(--pl-text-muted)]">Total Matches</div>
              <div className="text-2xl font-bold text-[var(--pl-green)]">{matches.length}</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-sm text-[var(--pl-text-muted)]">Filtered Matches</div>
              <div className="text-2xl font-bold text-[var(--pl-cyan)]">{filteredAndSortedMatches.length}</div>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="text-sm text-[var(--pl-text-muted)]">Season</div>
              <div className="text-2xl font-bold text-white">{selectedSeason}</div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="glass rounded-xl p-4 mb-6 border-2 border-[var(--pl-pink)]">
              <p className="text-[var(--pl-pink)]">Error: {error}</p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="glass rounded-xl p-8 text-center">
              <div className="text-[var(--pl-text-muted)]">Loading match data...</div>
            </div>
          )}

          {/* Match Table */}
          {!loading && !error && (
            <div className="glass rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--pl-card)] border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--pl-text-muted)]">Week</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--pl-text-muted)]">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--pl-text-muted)]">Home Team</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--pl-text-muted)]">Score</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--pl-text-muted)]">Away Team</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--pl-text-muted)]">Goal Scorers</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--pl-text-muted)]">Assists</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--pl-text-muted)]">Cards</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--pl-text-muted)]">Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedMatches.map((match, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-white">{match.week || '-'}</td>
                        <td className="px-4 py-3 text-sm text-white">{match.date || '-'}</td>
                        <td className="px-4 py-3 text-sm font-medium text-white">{match.home_team || '-'}</td>
                        <td className="px-4 py-3 text-center text-sm font-bold text-white">
                          {match.home_score || '-'} - {match.away_score || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-white">{match.away_team || '-'}</td>
                        <td className="px-4 py-3 text-xs text-[var(--pl-text-muted)] max-w-xs">
                          {match.home_scorers && (
                            <div className="mb-1">
                              <span className="text-[var(--pl-green)]">H:</span> {match.home_scorers}
                            </div>
                          )}
                          {match.away_scorers && (
                            <div>
                              <span className="text-[var(--pl-cyan)]">A:</span> {match.away_scorers}
                            </div>
                          )}
                          {!match.home_scorers && !match.away_scorers && '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--pl-text-muted)] max-w-xs">
                          {match.home_assists && (
                            <div className="mb-1">
                              <span className="text-[var(--pl-green)]">H:</span> {match.home_assists}
                            </div>
                          )}
                          {match.away_assists && (
                            <div>
                              <span className="text-[var(--pl-cyan)]">A:</span> {match.away_assists}
                            </div>
                          )}
                          {!match.home_assists && !match.away_assists && '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-[var(--pl-text-muted)] max-w-xs">
                          {match.home_cards && (
                            <div className="mb-1">
                              <span className="text-[var(--pl-green)]">H:</span> {match.home_cards}
                            </div>
                          )}
                          {match.away_cards && (
                            <div>
                              <span className="text-[var(--pl-cyan)]">A:</span> {match.away_cards}
                            </div>
                          )}
                          {!match.home_cards && !match.away_cards && '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--pl-text-muted)]">{match.attendance || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!loading && !error && filteredAndSortedMatches.length === 0 && (
            <div className="glass rounded-xl p-8 text-center">
              <p className="text-[var(--pl-text-muted)]">No matches found matching your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

