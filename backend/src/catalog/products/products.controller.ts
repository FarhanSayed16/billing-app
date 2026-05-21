import { 
  Controller, Get, Post, Patch, Delete, Body, Param, Query, 
  UseGuards, Request, UseInterceptors, UploadedFile, BadRequestException 
} from '@nestjs/common';
import { ProductsService, CreateProductDto, UpdateProductDto } from './products.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Roles(Role.SUPER_ADMIN)
  @Post()
  @ApiOperation({ summary: 'Create a new product' })
  async create(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productsService.create(req.user.brandId, createProductDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all active products for the brand' })
  async findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productsService.findAll(req.user.brandId, search, category, Number(page || 1), Number(limit || 20));
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Scan lookup by barcode' })
  async findByBarcode(@Param('barcode') barcode: string, @Request() req) {
    return this.productsService.findByBarcode(req.user.brandId, barcode);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a product fields' })
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Request() req) {
    return this.productsService.update(id, req.user.brandId, updateProductDto, req.user.userId);
  }

  @Roles(Role.SUPER_ADMIN)
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a product' })
  async remove(@Param('id') id: string, @Request() req) {
    return this.productsService.softDelete(id, req.user.brandId, req.user.userId);
  }

  @Roles(Role.SUPER_ADMIN)
  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload product image to S3 (Mocked implementation)' })
  async uploadImage(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) throw new BadRequestException('File is required');
    // Simulated S3/Cloud Storage implementation
    const mockedUrl = `https://billpush-assets.s3.mock.com/products/${id}/${file.originalname}`;
    await this.productsService.update(id, req.user.brandId, { image_url: mockedUrl }, req.user.userId);
    return { url: mockedUrl };
  }

  @Roles(Role.SUPER_ADMIN)
  @Post('bulk-upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload CSV for bulk product creations' })
  async bulkUpload(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file || !file.originalname.endsWith('.csv')) {
      throw new BadRequestException('A valid CSV file is required');
    }
    return this.productsService.processBulkCsv(req.user.brandId, file.buffer, req.user.userId);
  }
}
