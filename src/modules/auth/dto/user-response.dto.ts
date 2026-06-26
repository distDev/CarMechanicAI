import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { SubscriptionTier } from '../interfaces/subscription-tier.type';

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  email!: string | null;

  @ApiProperty({ example: false })
  isAnonymous!: boolean;

  @ApiPropertyOptional({ example: 'John Doe' })
  name!: string | null;

  @ApiPropertyOptional({
    example: 'https://lh3.googleusercontent.com/a/example',
  })
  avatarUrl!: string | null;

  @ApiProperty({ enum: ['FREE', 'PREMIUM'], example: 'FREE' })
  subscriptionTier!: SubscriptionTier;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: Date;
}
