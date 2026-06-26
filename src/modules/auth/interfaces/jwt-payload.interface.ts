import { SubscriptionTier } from './subscription-tier.type';

export interface JwtPayload {
  sub: string;
  sessionId: string;
  isAnonymous: boolean;
  tier: SubscriptionTier;
}
