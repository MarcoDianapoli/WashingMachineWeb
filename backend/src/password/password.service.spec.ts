import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(() => {
    service = new PasswordService();
  });

  it('hashes and matches a valid password', async () => {
    const hash = await service.hashPassword('secreto123');
    expect(hash).not.toBe('secreto123');
    expect(await service.comparePassword('secreto123', hash)).toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await service.hashPassword('secreto123');
    expect(await service.comparePassword('otra', hash)).toBe(false);
  });

  it('produces different hashes for the same password (salt)', async () => {
    const h1 = await service.hashPassword('secreto123');
    const h2 = await service.hashPassword('secreto123');
    expect(h1).not.toBe(h2);
  });
});
