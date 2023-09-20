export interface EnrichedSession {
  id: string;
  ip: string;
  browser: Record<string, any>;
  device: Record<string, any>;
  os: Record<string, any>;
}
