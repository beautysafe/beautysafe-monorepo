import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Family } from '../../families/entities/family.entity';

export enum IngredientStatus {
  ACTIVE = 'ACTIVE',
  NEW = 'NEW',
}

@Entity()
export class Ingredient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  officialName: string;

  @Column('float')
  score: number;

  @ApiProperty({
    example: 5,
    enum: [0, 2, 3, 5, 10],
    default: 0,
    description: 'BeautySafe ingredient risk score',
  })
  @Column({ type: 'integer', default: 0 })
  bs_score: number;

  @Column({
    type: 'enum',
    enum: IngredientStatus,
    default: IngredientStatus.ACTIVE,
  })
  @ApiProperty({ enum: IngredientStatus, example: IngredientStatus.ACTIVE })
  status: IngredientStatus;

  @ManyToMany(() => Family, { eager: true })
  @JoinTable({ name: 'ingredient_families' })
  families: Family[];
}
