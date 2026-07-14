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

  @ApiProperty({ required: false, description: 'Firebase Storage object path' })
  @Column({ type: 'varchar', length: 500, nullable: true })
  imageKey?: string | null;

  @ApiProperty({ type: [String], description: 'Video URLs' })
  @Column('text', { array: true })
  videos: string[];

  @ApiProperty({
    type: [String],
    required: false,
    description: 'Firebase Storage object paths for videos',
  })
  @Column('text', { array: true, default: () => "'{}'" })
  videoKeys: string[];
}
