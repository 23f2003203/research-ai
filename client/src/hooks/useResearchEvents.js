import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { BASE_URL } from '../services/api.js';

export function useResearchEvents(researchId, onComplete) {
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const [currentStage, setCurrentStage] = useState('initializing');
  const [coverageScore, setCoverageScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!researchId) return;

    let eventSource = null;
    let isCancelled = false;

    try {
      eventSource = new EventSource(`${BASE_URL}/research/${researchId}/events`, {
        withCredentials: true,
      });

      eventSource.onopen = () => {
        if (!isCancelled) setConnected(true);
      };

      eventSource.onmessage = (e) => {
        if (isCancelled || !e.data) return;

        try {
          const parsed = JSON.parse(e.data);

          if (parsed.type === 'connected') {
            return;
          }

          setEvents((prev) => {
            // Deduplicate events by id
            if (prev.some((item) => item.id === parsed.id)) {
              return prev;
            }
            return [...prev, parsed];
          });

          if (parsed.stage) {
            setCurrentStage(parsed.stage);
          }

          if (parsed.metadata?.coverageScore !== undefined) {
            setCoverageScore(parsed.metadata.coverageScore);
          }

          if (parsed.eventType === 'research_completed') {
            setIsCompleted(true);
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFD6E0', '#FFE7D1', '#FFF3C4', '#D4EDDA', '#EDE7F6'],
              });
            } catch (err) {}
            if (onComplete) onComplete(parsed);
          }

          if (parsed.eventType === 'research_failed') {
            setError(parsed.message || 'Research failed');
          }
        } catch (parseErr) {
          console.warn('Failed to parse SSE event data', parseErr);
        }
      };

      eventSource.onerror = (err) => {
        // SSE triggers error on server close or disconnect
        if (!isCancelled) {
          setConnected(false);
        }
      };
    } catch (err) {
      if (!isCancelled) setError(err.message);
    }

    return () => {
      isCancelled = true;
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [researchId]);

  return {
    events,
    connected,
    currentStage,
    coverageScore,
    isCompleted,
    error,
  };
}
