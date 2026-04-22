export abstract class AbstractEmailSender {
  public abstract sendEmailConfirmation(
    email: string,
    verificationCode: string,
  ): Promise<void>;

  public abstract sendPasswordRecovery(
    email: string,
    recoveryCode: string,
  ): Promise<void>;
}
