import { ApiProperty } from '@nestjs/swagger';
import { EnrichedSession } from '../interfaces';

export class EnrichedSessionDto implements EnrichedSession {
  @ApiProperty()
  id: string;
  @ApiProperty()
  ip: string;
  @ApiProperty()
  browser: Record<string, any>;
  @ApiProperty()
  device: Record<string, any>;
  @ApiProperty()
  os: Record<string, any>;
}
