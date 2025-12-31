'use client';

import { useState, useEffect, useCallback } from 'react';
import { fplApi } from '@/lib/api';

export function useFollowedPlayers() {
  const [followedPlayers, setFollowedPlayers] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load followed players on mount
  useEffect(() => {
    loadFollowedPlayers();
  }, []);

  const loadFollowedPlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fplApi.getFollowedPlayers();
      setFollowedPlayers(new Set(data.map((p: any) => p.player_id)));
    } catch (err: any) {
      console.error('Failed to load followed players:', err);
      setError(err.message || 'Failed to load followed players');
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = useCallback(async (playerId: number, willFollow: boolean) => {
    // Optimistic update
    setFollowedPlayers(prev => {
      const newSet = new Set(prev);
      if (willFollow) {
        newSet.add(playerId);
      } else {
        newSet.delete(playerId);
      }
      return newSet;
    });

    try {
      if (willFollow) {
        await fplApi.followPlayer(playerId);
      } else {
        await fplApi.unfollowPlayer(playerId);
      }
    } catch (err: any) {
      // Revert on error
      setFollowedPlayers(prev => {
        const newSet = new Set(prev);
        if (willFollow) {
          newSet.delete(playerId);
        } else {
          newSet.add(playerId);
        }
        return newSet;
      });
      
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update follow status';
      throw new Error(errorMessage);
    }
  }, []);

  const isFollowed = useCallback((playerId: number) => {
    return followedPlayers.has(playerId);
  }, [followedPlayers]);

  return {
    followedPlayers,
    isFollowed,
    toggleFollow,
    loading,
    error,
    refresh: loadFollowedPlayers,
  };
}
