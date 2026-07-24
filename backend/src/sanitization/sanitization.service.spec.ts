import { SanitizationService } from './sanitization.service';

describe('SanitizationService', () => {
  let service: SanitizationService;

  beforeEach(() => {
    service = new SanitizationService();
  });

  it('removes Mongo operators at the root level', () => {
    const input: Record<string, unknown> = {
      email: 'a@b.com',
      $where: 'malicioso',
    };
    service.sanitize(input);
    expect(input).toEqual({ email: 'a@b.com' });
  });

  it('removes nested operators', () => {
    const input: Record<string, unknown> = {
      filter: { role: { $ne: 'admin' } },
    };
    service.sanitize(input);
    expect(input).toEqual({ filter: { role: {} } });
  });

  it('sanitizes objects inside arrays', () => {
    const input = [{ $gt: '' }, { ok: 1 }];
    service.sanitize(input);
    expect(input).toEqual([{}, { ok: 1 }]);
  });

  it('mutates the original object (Express 5 requirement)', () => {
    const input: Record<string, unknown> = { $set: { a: 1 }, b: 2 };
    const result = service.sanitize(input);
    expect(result).toBe(input);
    expect(input).toEqual({ b: 2 });
  });

  it('leaves strings and primitives untouched', () => {
    expect(service.sanitize('$where')).toBe('$where');
    expect(service.sanitize(5)).toBe(5);
    expect(service.sanitize(null)).toBeNull();
  });
});
