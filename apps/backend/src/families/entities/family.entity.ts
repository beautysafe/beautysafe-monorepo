import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Family {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('float')
  score: number;
}
