export class ResentConfirmationEmailEvent {
  constructor(
    public readonly email: string,
    public readonly code: string,
  ) {}
}
