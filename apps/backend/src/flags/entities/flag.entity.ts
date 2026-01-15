import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Flag {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ default: 0 })
  totalProducts: number;
}
