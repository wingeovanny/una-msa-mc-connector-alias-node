export class Alias {
  requirementId: string;
  secondId: string;
  metadata: Record<string, unknown>;
  status: string;
  ttl: Date;
  origin?: string;
}
