import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateMeDto } from './dto/update-me.dto';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
  ) {}

  async findByEmail(email: string) {
    return this.usersRepo.findOne({ where: { email } });
  }

  async findById(id: number) {
    return this.usersRepo.findOne({ where: { id } });
  }

  // Used by your register()
  async create(email: string, passwordHash: string, role: any) {
    const u = this.usersRepo.create({ email, password: passwordHash, role });
    return this.usersRepo.save(u);
  }

  async getMe(userId: number) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    // never return password
    const { password, ...safe } = user as any;
    return safe;
  }

  async updateMe(userId: number, dto: UpdateMeDto) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, dto);
    const saved = await this.usersRepo.save(user);

    const { password, ...safe } = saved as any;
    return safe;
  }

  async deleteMe(userId: number) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.usersRepo.delete({ id: userId });
    return { message: 'Account deleted' };
  }

  // ---------------- Favorites ----------------

  async listFavorites(userId: number) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: { favorites: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user.favorites ?? [];
  }

  async addFavorite(userId: number, productUid: number) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: { favorites: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const product = await this.productsRepo.findOne({ where: { uid: productUid } as any });
    if (!product) throw new NotFoundException('Product not found');

    const favorites = user.favorites ?? [];
    const exists = favorites.some(p => (p as any).uid === productUid);
    if (!exists) favorites.push(product);

    user.favorites = favorites;
    await this.usersRepo.save(user);

    return { message: 'Added to favorites' };
  }

  async removeFavorite(userId: number, productUid: number) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: { favorites: true },
    });
    if (!user) throw new NotFoundException('User not found');

    user.favorites = (user.favorites ?? []).filter(p => (p as any).uid !== productUid);
    await this.usersRepo.save(user);

    return { message: 'Removed from favorites' };
  }
}
