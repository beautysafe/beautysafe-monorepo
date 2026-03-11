import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Story {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiProperty({ description: 'Image URL' })
  @Column({ type: 'varchar', length: 500 })
  image: string;

  @ApiProperty({ type: [String], description: 'Video URLs' })
  @Column('text', { array: true })
  videos: string[];
}
