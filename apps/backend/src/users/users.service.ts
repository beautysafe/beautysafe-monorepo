import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateMeDto } from './dto/update-me.dto';
import { Product } from 'src/products/entities/product.entity';
import * as bcrypt from 'bcrypt';
import { FirebaseStorageService } from '../storage/firebase-storage.service';
import { UploadFolder } from '../storage/upload-folder.enum';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Product) private productsRepo: Repository<Product>,
    private readonly storage: FirebaseStorageService,
  ) {}

  async findByEmail(email: string) {
    return this.usersRepo.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: number) {
    return this.usersRepo.findOne({ where: { id } });
  }

  async create(email: string, password: string, role: any) {
    const passwordHash = await bcrypt.hash(password, 10);

    const u = this.usersRepo.create({
      email: email.toLowerCase(),
      password: passwordHash,
      role,
    });

    const saved = await this.usersRepo.save(u);

    const { password: _pw, ...safe } = saved as any;
    return safe;
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

    const previousKey = user.avatarKey;
    Object.assign(user, dto);
    let saved: User;
    try {
      saved = await this.usersRepo.save(user);
    } catch (error) {
      if (dto.avatarKey && dto.avatarKey !== previousKey) {
        await this.cleanup(dto.avatarKey);
      }
      throw error;
    }
    if (previousKey && previousKey !== saved.avatarKey) {
      await this.cleanup(previousKey);
    }

    const { password, ...safe } = saved as any;
    return safe;
  }

  async deleteMe(userId: number) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.usersRepo.delete({ id: userId });
    await this.cleanup(user.avatarKey);
    return { message: 'Account deleted' };
  }

  // ---------------- Favorites ----------------

  async listFavorites(userId: number) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    return this.productsRepo
      .createQueryBuilder('p')
      .innerJoin('p.favoritedBy', 'u', 'u.id = :userId', { userId })
      .leftJoinAndSelect('p.images', 'images')
      .leftJoinAndSelect('p.brand', 'brand')
      .orderBy('p.uid', 'DESC')
      .getMany();
  }

  async addFavorite(userId: number, productUid: number) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: { favorites: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const product = await this.productsRepo.findOne({
      where: { uid: productUid } as any,
    });
    if (!product) throw new NotFoundException('Product not found');

    const favorites = user.favorites ?? [];
    const exists = favorites.some((p) => (p as any).uid === productUid);
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

    user.favorites = (user.favorites ?? []).filter(
      (p) => (p as any).uid !== productUid,
    );
    await this.usersRepo.save(user);

    return { message: 'Removed from favorites' };
  }
  async updateAvatar(userId: number, file: Express.Multer.File) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const previousKey = user.avatarKey;
    const uploaded = await this.storage.uploadImage(file, UploadFolder.AVATARS);
    user.avatarUrl = uploaded.url;
    user.avatarKey = uploaded.storagePath;

    let saved: User;
    try {
      saved = await this.usersRepo.save(user);
    } catch (error) {
      await this.cleanup(uploaded.storagePath);
      throw error;
    }
    if (previousKey && previousKey !== uploaded.storagePath) {
      await this.cleanup(previousKey);
    }
    const { password, ...safe } = saved as any;
    return safe;
  }

  private async cleanup(storagePath?: string | null) {
    if (!storagePath) return;
    try {
      await this.storage.deleteFile(storagePath);
    } catch (error) {
      this.logger.error(
        `Firebase cleanup failed for user avatar ${storagePath}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
