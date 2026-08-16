import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Brand {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'CeraVe' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ example: 25 })
  @Column({ default: 0 })
  totalProducts: number;
}
