export class SentRecoveryPasswordEvent {
  constructor(
    public readonly email: string,
    public readonly code: string,
  ) {}
}
