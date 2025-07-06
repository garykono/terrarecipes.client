import { useCallback, useMemo } from "react";
import Fuse from "fuse.js";
import type { FuseOptionKey } from 'fuse.js';


export interface AutoSuggestProps<T> {
    autoSuggestionsList: T;
    keys: FuseOptionKey<T>[];
}

export interface AutoSuggestResult<T> {
    name: string;
    confidence: number;
}

export function useAutoSuggest<T extends { name: string }[]>({ autoSuggestionsList, keys }: AutoSuggestProps<T>) {
    const fuse = useMemo(() => {
        return new Fuse(autoSuggestionsList, {
            keys,
            threshold: 0.3,
            includeScore: true
        });
    }, [autoSuggestionsList, keys]); // only recreate if data changes

    
    return useCallback((query: string): AutoSuggestResult<T>[] => {
        const trimmedQuery = query.trim();
        if (!trimmedQuery) return [];

        return fuse.search(trimmedQuery).map(result => {
            if (!result.score) {
                throw new Error("Fuse result is missing a score. Make sure includeScore: true is set in fuse options.");
            }

            return {
                ...result.item,
                confidence: computeConfidence({
                    score: result.score,
                    query: trimmedQuery,
                    matchText: result.item.name
                })
            };
        }).sort((a, b) => b.confidence - a.confidence);
    }, [fuse]);
}

interface ComputeConfidenceProps {
    score?: number;
    query: string;
    matchText: string;
}

function computeConfidence({ score, query, matchText }: ComputeConfidenceProps): number {
    const q = query.trim().toLowerCase();
    const text = matchText.trim().toLowerCase();

    if (!q || !text) return 0;

    if (q === text) return 1;

    if (!score) {
        throw new Error("Cannot computer confidence with no initial score from fuse.");
    }

    let confidence = 1 - score;

    // === Penalty for short queries ===
    const queryLength = q.length;
    const matchLength = text.length;
    const lengthGap = matchLength - queryLength;

    // Penalize short query that matches a long result
    if (lengthGap > 0) {
        let lengthPenaltyModifier;
        if (queryLength <= 1) {
            lengthPenaltyModifier = .3
        } else if (queryLength <= 2) {
            lengthPenaltyModifier = .2
        } else if (queryLength <= 4) {
            lengthPenaltyModifier = .10
        } else {
            lengthPenaltyModifier = .06
        }


        const lengthPenalty = Math.min(0.5, lengthGap * lengthPenaltyModifier); // Up to 0.5 penalty
        confidence -= lengthPenalty;
    }

    // === Bonus if match starts with query ===
    if (text.startsWith(q)) confidence += 0.1;

    // Clamp between 0 and 1
    return Math.max(0, Math.min(1, confidence));
}
