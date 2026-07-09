import { ApiProperty } from '@nestjs/swagger';

export class FileMetadataResponseDto {
  @ApiProperty({
    example: 'vehicles/photos/550e8400-e29b-41d4-a716-446655440000.jpg',
  })
  path!: string;

  @ApiProperty({
    example:
      'http://localhost:3000/uploads/vehicles/photos/550e8400-e29b-41d4-a716-446655440000.jpg',
  })
  url!: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType!: string;

  @ApiProperty({ example: 102400 })
  size!: number;

  @ApiProperty({ example: 'photo.jpg' })
  originalName!: string;
}
