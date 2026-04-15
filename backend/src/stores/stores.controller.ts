import { Controller, Get, Post, Body, Patch, Param, UseGuards, Req, UploadedFile, UseInterceptors, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('stores')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stores')
export class StoresController {
  constructor(private readonly storesService: StoresService) {}

  @Post()
  @Roles(Role.STORE_ADMIN)
  create(@Body() createStoreDto: CreateStoreDto, @Req() req: any) {
    return this.storesService.create(createStoreDto, req.user.userId, req.user.brandId);
  }

  @Get()
  @Roles(Role.SUPER_ADMIN)
  findAll(@Req() req: any) {
    return this.storesService.findAll(req.user.brandId);
  }

  @Get(':id')
  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN)
  findOne(@Param('id') id: string, @Req() req: any) {
    const userStoreId = req.user.role === Role.STORE_ADMIN ? req.user.storeId : undefined;
    return this.storesService.findOne(id, req.user.brandId, userStoreId);
  }

  @Patch(':id')
  @Roles(Role.SUPER_ADMIN, Role.STORE_ADMIN)
  update(@Param('id') id: string, @Body() updateStoreDto: UpdateStoreDto, @Req() req: any) {
    const userStoreId = req.user.role === Role.STORE_ADMIN ? req.user.storeId : undefined;
    return this.storesService.update(id, updateStoreDto, req.user.brandId, userStoreId);
  }

  @Patch(':id/deactivate')
  @Roles(Role.SUPER_ADMIN)
  deactivate(@Param('id') id: string, @Req() req: any) {
    return this.storesService.setActivation(id, req.user.brandId, false);
  }

  @Patch(':id/activate')
  @Roles(Role.SUPER_ADMIN)
  activate(@Param('id') id: string, @Req() req: any) {
    return this.storesService.setActivation(id, req.user.brandId, true);
  }

  @Post(':id/logo')
  @Roles(Role.STORE_ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  uploadLogo(
    @Param('id') id: string,
    @Req() req: any,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
        ],
      }),
    ) file: Express.Multer.File,
  ) {
    const userStoreId = req.user.role === Role.STORE_ADMIN ? req.user.storeId : undefined;
    return this.storesService.uploadLogo(id, req.user.brandId, userStoreId, file);
  }
}
