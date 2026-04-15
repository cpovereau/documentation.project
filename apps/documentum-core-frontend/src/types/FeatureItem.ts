export interface FeatureItem {
  id: number;
  name: string;
  level: number;
  expanded?: boolean;
  active?: boolean;
  hasUpdate?: boolean;
  hasEvolution?: boolean;
  hasCorrectif?: boolean;
}
