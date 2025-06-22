export async function down(): Promise<void> {
  // await knex.raw("DROP EVENT IF EXISTS `session_cleanup`");
}

export async function up(): Promise<void> {
  // await knex.raw(
  //   `
  //   CREATE EVENT IF NOT EXISTS session_cleanup
  //     ON SCHEDULE
  //       EVERY 1 HOUR
  //     COMMENT 'Cleanup expired sessions'
  //     DO
  //       DELETE FROM sessions WHERE expiresAt < ?;
  // `,
  //   [knex.fn.now()],
  // );
}
