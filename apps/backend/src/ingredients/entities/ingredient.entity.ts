import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
  PrimaryColumn,
} from 'typeorm';
import { Family } from '../../families/entities/family.entity';

@Entity()
export class Ingredient {
  @PrimaryColumn({ type: 'int' })
  id: number;

  @Column()
  name: string;

  @Column()
  officialName: string;

  @Column('float')
  score: number;

  @ManyToMany(() => Family, { eager: true })
  @JoinTable({ name: 'ingredient_families' })
  families: Family[];
}
