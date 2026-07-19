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
  UseGuards,
} from '@nestjs/common';
import { GetUsersQueryParams } from './input-dto/get-users.query-params.input-dto';
import { CreateUserInputDto } from './input-dto/create-user-input.dto';
import { ApiParam } from '@nestjs/swagger';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { ParseObjectIdOrBadRequestPipe } from '../../../core/pipes/ParseObjectIdOrBadRequestPipe';
import { BasicAuthGuard } from '../../auth/guards/basic-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/usecases/create-user.usecase';
import { DeleteUserCommand } from '../application/usecases/delete-user.usecase';

@Controller('users')
export class UsersController {
  constructor(
    @Inject() private usersQueryRepository: UsersQueryRepository,
    @Inject() private commandBus: CommandBus,
  ) { }

  @Get()
  async getAll(@Query() query: GetUsersQueryParams) {
    return this.usersQueryRepository.getAll(query);
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  async createUser(@Body() dto: CreateUserInputDto) {
    const userId = await this.commandBus.execute<CreateUserCommand, string>(
      new CreateUserCommand(dto),
    );
    return this.usersQueryRepository.getByIdOrFail(userId);
  }

  @ApiParam({ name: 'id' })
  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id', ParseObjectIdOrBadRequestPipe) id: string) {
    return this.commandBus.execute<DeleteUserCommand, string>(
      new DeleteUserCommand(id),
    );
  }
}
