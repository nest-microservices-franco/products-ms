import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDto } from 'src/common/dto';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductsService');

  onModuleInit() {
    this.$connect();
    this.logger.log('Database connected');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: createProductDto,
    });
  }

  async findAll(parginationDto: PaginationDto) {
    const { page, limit } = parginationDto;

    const totalPages = await this.product.count({ where: { deleted: false } });
    const lastPage = Math.ceil(totalPages / limit);

    return {
      data: await this.product.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { deleted: false },
      }),
      meta: {
        total: totalPages,
        lastPage,
        page,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: { id, deleted: false },
    });

    if (!product) {
      // this.logger.error(`Product with id: ${id} not found`);
      throw new RpcException(`Product with id: ${id} not found`);
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);

    const { id: __, ...data } = updateProductDto;

    return this.product.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.product.update({
      where: { id },
      data: {
        deleted: true,
      },
    });
  }
}
