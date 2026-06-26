import { SubscriptionTier } from './subscription-tier.type';

export interface AuthenticatedUser {
  id: string;
  sessionId: string;
  isAnonymous: boolean;
  tier: SubscriptionTier;
}
