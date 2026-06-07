import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Ingredient } from '../../ingredients/entities/ingredient.entity';
import { SubGroup } from '../../subgroups/entities/subgroup.entity';
import { JourneyPhase } from './journey-phase.entity';

@Entity('journeys')
export class Journey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => SubGroup, (subgroup) => subgroup.journeys, {
    eager: true,
    onDelete: 'CASCADE',
  })
  subgroup: SubGroup;

  @OneToMany(() => JourneyPhase, (phase) => phase.journey)
  phases: JourneyPhase[];

  @ManyToMany(() => Ingredient)
  @JoinTable({
    name: 'journey_ingredients',
    joinColumn: { name: 'journeyId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'ingredientId', referencedColumnName: 'id' },
  })
  ingredients: Ingredient[];
}
