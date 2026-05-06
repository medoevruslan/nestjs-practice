class CreateUserCommand {
  constructor(
    public login: string,
    public email: string,
    public password: string,
  ) {}
}

export class CreateUserUseCase {
  constructor() {}

  public async execute() {}
}
