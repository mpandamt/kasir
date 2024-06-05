import { ApiProperty } from '@nestjs/swagger';
import { ZodIssue } from 'zod';

export class Paging {
  @ApiProperty()
  size: number;
  @ApiProperty()
  totalPage: number;
  @ApiProperty()
  currentPage: number;
}

export class WebResponse<T> {
  @ApiProperty()
  data: T;
  @ApiProperty()
  message?: string;
  @ApiProperty()
  errors?: ZodIssue[];
  @ApiProperty()
  paging?: Paging;
}
