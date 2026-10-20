import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserLoginToComments1792130000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE comments
      ADD COLUMN IF NOT EXISTS user_login VARCHAR(100)
    `);

    await queryRunner.query(`
      UPDATE comments AS c
      SET user_login = u.login
      FROM users AS u
      WHERE c.user_id = u.id
        AND c.user_login IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE comments
      ALTER COLUMN user_login SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE comments
      DROP COLUMN IF EXISTS user_login
    `);
  }
}
