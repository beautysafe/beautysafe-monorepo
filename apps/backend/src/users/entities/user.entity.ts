import { Entity, PrimaryGeneratedColumn, Column, JoinTable, ManyToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/products/entities/product.entity';

export enum UserRole {
  ADMIN = 'admin',
  CLIENT = 'client',
}

@Entity()
export class User {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column({ unique: true })
  email: string;

  @ApiProperty({ enum: UserRole })
  @Column({ type: 'enum', enum: UserRole, default: UserRole.CLIENT })
  role: UserRole;

  @Column()
  password: string; // hashed

  @ApiProperty({ type: String, required: false, description: 'Birthday of the user (YYYY-MM-DD)' })
  @Column({ type: 'date', nullable: true })
  birthday?: string;

  @ApiProperty({ type: String, required: false, description: 'Type of skin' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  skinType?: string;

  @ApiProperty({ type: String, required: false, description: 'Type of hair' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  hairType?: string;

  @ApiProperty({ type: String, required: false, description: 'Phone number' })
  @Column({ type: 'varchar', length: 30, nullable: true })
  phoneNumber?: string;

  @ApiProperty({ type: String, required: false, description: 'Address' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  address?: string;

  @ApiProperty({ type: () => [Product], required: false })
  @ManyToMany(() => Product, (p) => p.favoritedBy, { eager: false })
  @JoinTable({
    name: 'user_favorites',
    joinColumn: { name: 'userId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'productUid', referencedColumnName: 'uid' },
  })
  favorites?: Product[];

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarUrl?: string;

  @ApiProperty({ required: false })
  @Column({ type: 'varchar', length: 500, nullable: true })
  avatarKey?: string; 
    
}
