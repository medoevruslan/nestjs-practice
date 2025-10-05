import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { GetUsersQueryParams } from './input-dto/get-users.query-params.input-dto';
import { CreateUserInputDto } from './input-dto/create-user-input.dto';
import { ApiParam } from '@nestjs/swagger';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { UsersService } from '../application/users.service';

@Controller('users')
export class UsersController {
  constructor(
    @Inject() private usersQueryRepository: UsersQueryRepository,
    @Inject() private usersService: UsersService,
  ) {}

  @Get()
  async getAll(@Query() query: GetUsersQueryParams) {
    return this.usersQueryRepository.getAll(query);
  }

  @Post()
  async createUser(@Body() dto: CreateUserInputDto) {
    const userId = await this.usersService.createUser(dto);
    return this.usersQueryRepository.getByIdOrFail(userId);
  }

  @ApiParam({ name: 'id' })
  @Delete('id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
