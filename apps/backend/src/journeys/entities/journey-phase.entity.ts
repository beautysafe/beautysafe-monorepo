import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { Journey } from './journey.entity';

@Entity('journey_phases')
export class JourneyPhase {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text' })
  htmlText: string;

  @Column({ default: 0 })
  sortOrder: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Journey, (journey) => journey.phases, {
    onDelete: 'CASCADE',
  })
  journey: Journey;

  @ManyToMany(() => Product)
  @JoinTable({
    name: 'journey_phase_products',
    joinColumn: { name: 'journeyPhaseId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productUid', referencedColumnName: 'uid' },
  })
  products: Product[];
}
