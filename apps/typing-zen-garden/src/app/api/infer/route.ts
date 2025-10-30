import { NextRequest, NextResponse } from 'next/server';

/**
 * Represents a single keystroke event
 */
interface KeystrokeEvent {
  char: string;
  timestamp: number;
}

/**
 * Request body interface for the inference API
 */
interface InferenceRequest {
  events: KeystrokeEvent[];
  mode?: 'simple' | 'server';
}

/**
 * Response data structure for the inference API
 */
interface InferenceResponse {
  score: number;
  suggestedTone: string;
  particleHint: {
    size: number;
    speed: number;
    color: string;
  };
}

// Constants for the inference logic
const INTERVAL_WINDOW_SIZE = 10;
const BASE_COLORS = ['#64b5f6', '#81c784', '#ba68c8', '#ffb74d'];
const WEIGHT_MATRIX = [
  [0.3, 0.2, 0.1, 0.1, 0.05, 0.05, 0.05, 0.05, 0.05, 0.05], // Fast typing weights
  [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],      // Steady typing weights
  [0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.1, 0.2, 0.2, 0.3]  // Slow typing weights
];

/**
 * Calculates inter-key intervals from keystroke events
 */
function calculateIntervals(events: KeystrokeEvent[]): number[] {
  return events
    .slice(1)
    .map((event, i) => event.timestamp - events[i].timestamp)
    .slice(-INTERVAL_WINDOW_SIZE);
}

/**
 * Normalizes an array of numbers to values between 0 and 1
 */
function normalize(intervals: number[]): number[] {
  const max = Math.max(...intervals);
  const min = Math.min(...intervals);
  return intervals.map(interval => 
    max === min ? 0.5 : (interval - min) / (max - min)
  );
}

/**
 * Performs matrix multiplication for scoring
 */
function matrixMultiply(intervals: number[], weights: number[]): number {
  return intervals.reduce((sum, val, i) => sum + val * weights[i], 0);
}

/**
 * Analyzes typing patterns and generates inference results
 */
function analyzeTyping(normalizedIntervals: number[]): InferenceResponse {
  // Calculate scores for each typing pattern
  const scores = WEIGHT_MATRIX.map(weights => 
    matrixMultiply(normalizedIntervals, weights)
  );
  
  const maxScore = Math.max(...scores);
  const patternIndex = scores.indexOf(maxScore);
  
  // Map pattern to response parameters
  const patterns = {
    0: { tone: 'energetic', size: 4, speed: 2.5, colorIndex: 0 },
    1: { tone: 'balanced', size: 3, speed: 1.5, colorIndex: 1 },
    2: { tone: 'mindful', size: 2, speed: 1, colorIndex: 2 }
  };
  
  const pattern = patterns[patternIndex as keyof typeof patterns];
  
  return {
    score: maxScore,
    suggestedTone: pattern.tone,
    particleHint: {
      size: pattern.size,
      speed: pattern.speed,
      color: BASE_COLORS[pattern.colorIndex]
    }
  };
}

/**
 * Validates the request body
 */
function validateRequest(body: any): body is InferenceRequest {
  return (
    body &&
    Array.isArray(body.events) &&
    body.events.length > 0 &&
    body.events.every((event: any) =>
      typeof event.char === 'string' &&
      typeof event.timestamp === 'number'
    ) &&
    (!body.mode || ['simple', 'server'].includes(body.mode))
  );
}

/**
 * API route handler for typing pattern inference
 * 
 * @example
 * ```typescript
 * // Client-side usage:
 * const response = await fetch('/api/infer', {
 *   method: 'POST',
 *   headers: {
 *     'Content-Type': 'application/json',
 *   },
 *   body: JSON.stringify({
 *     events: [
 *       { char: 'a', timestamp: 1635789600000 },
 *       { char: 'b', timestamp: 1635789600100 },
 *     ],
 *     mode: 'simple'
 *   })
 * });
 * const data = await response.json();
 * ```
 */
export async function POST(req: NextRequest) {
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Read middleware-added headers
  const isDevEnvironment = req.headers.get('x-typing-garden') === 'dev';
  const requestTime = req.headers.get('x-request-time');
  const requestStartTime = req.headers.get('x-request-start');

  // Log development information
  if (isDevEnvironment) {
    console.log(`[Dev] Request received at ${requestTime}`);
    if (requestStartTime) {
      const processingTime = Date.now() - parseInt(requestStartTime);
      console.log(`[Dev] Request processing time: ${processingTime}ms`);
    }
  }

  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { headers });
  }

  try {
    const body = await req.json();

    if (!validateRequest(body)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400, headers }
      );
    }

    const intervals = calculateIntervals(body.events);
    
    // Need at least INTERVAL_WINDOW_SIZE intervals for analysis
    if (intervals.length < INTERVAL_WINDOW_SIZE) {
      return NextResponse.json(
        { error: 'Not enough keystroke events' },
        { status: 400, headers }
      );
    }

    const normalizedIntervals = normalize(intervals);
    const result = analyzeTyping(normalizedIntervals);

    // Simulate server processing delay if server mode is requested
    if (body.mode === 'server') {
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    return NextResponse.json(result, { headers });

  } catch (error) {
    console.error('Inference error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500, headers }
    );
  }
}

// Enable edge runtime for better performance
export const runtime = 'edge';