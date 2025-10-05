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

@Controller('users')
export class UsersController {
  constructor(@Inject() private usersQueryRepository: UsersQueryRepository) {}

  @Get()
  getAll(@Query() query: GetUsersQueryParams) {
    return this.usersQueryRepository.getAll(query);
  }

  @Post()
  createUser(@Body() dto: CreateUserInputDto) {}

  @ApiParam({ name: 'id' })
  @Delete('id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteUser(@Param('id') id: string) {}
}
