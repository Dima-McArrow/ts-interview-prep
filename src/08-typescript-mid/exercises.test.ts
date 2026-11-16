import { describe, expect, it, vi } from 'vitest';
import {
  createEmitter,
  describeEvent,
  groupByKey,
  isUser,
  parseAge,
  parseConfig,
  type User,
} from './exercises';

describe('08 typescript · Part 1 — Runtime tasks', () => {
  it('T1 isUser', () => {
    expect(isUser({ id: 1, name: 'Ann', role: 'admin' })).toBe(true);
    expect(isUser({ id: 1, name: 'Ann', role: 'user', email: 'a@x' })).toBe(true);
    expect(isUser({ id: '1', name: 'Ann', role: 'admin' })).toBe(false);
    expect(isUser({ id: 1, name: 'Ann', role: 'root' })).toBe(false);
    expect(isUser({ id: 1, name: 'Ann', role: 'user', email: 42 })).toBe(false);
    expect(isUser(null)).toBe(false);
    expect(isUser('Ann')).toBe(false);
  });

  it('T2 groupByKey', () => {
    const users: User[] = [
      { id: 1, name: 'Ann', role: 'admin' },
      { id: 2, name: 'Bob', role: 'user' },
      { id: 3, name: 'Cid', role: 'user' },
    ];
    const grouped = groupByKey(users, 'role');
    expect(Object.keys(grouped)).toEqual(['admin', 'user']);
    expect(grouped.user!.map((u) => u.name)).toEqual(['Bob', 'Cid']);
    expect(Object.keys(groupByKey(users, 'id'))).toEqual(['1', '2', '3']);
  });

  it('T3 describeEvent', () => {
    expect(describeEvent({ type: 'login', user: 'ann' })).toBe('ann logged in');
    expect(describeEvent({ type: 'logout', user: 'ann' })).toBe('ann logged out');
    expect(describeEvent({ type: 'purchase', user: 'bob', items: ['a', 'b'], total: 30 })).toBe(
      'bob bought 2 item(s) for 30€',
    );
    expect(describeEvent({ type: 'error', code: 500, message: 'Oops' })).toBe('Error 500: Oops');
  });

  it('T4 parseAge', () => {
    expect(parseAge('42')).toEqual({ ok: true, value: 42 });
    expect(parseAge('0')).toEqual({ ok: true, value: 0 });
    expect(parseAge('abc')).toEqual({ ok: false, error: 'not a number' });
    expect(parseAge('')).toEqual({ ok: false, error: 'not a number' });
    expect(parseAge('-1')).toEqual({ ok: false, error: 'out of range' });
    expect(parseAge('151')).toEqual({ ok: false, error: 'out of range' });
    expect(parseAge('1.5')).toEqual({ ok: false, error: 'not an integer' });
  });

  it('T5 parseConfig', () => {
    expect(parseConfig({ host: 'localhost', port: 8080 })).toEqual({
      host: 'localhost',
      port: 8080,
      debug: false,
    });
    expect(parseConfig({ host: 'h', port: 1, debug: true }).debug).toBe(true);
    expect(() => parseConfig({ host: '', port: 80 })).toThrow('Invalid config: host');
    expect(() => parseConfig({ host: 'h', port: 70000 })).toThrow('Invalid config: port');
    expect(() => parseConfig({ host: 'h', port: '80' })).toThrow('Invalid config: port');
    expect(() => parseConfig({ host: 'h', port: 80, debug: 'yes' })).toThrow(
      'Invalid config: debug',
    );
    expect(() => parseConfig(null)).toThrow('Invalid config: host');
  });

  it('T6 createEmitter', () => {
    const emitter = createEmitter<{ login: { user: string }; logout: undefined }>();
    const onLogin = vi.fn();
    const onLogout = vi.fn();
    const off = emitter.on('login', onLogin);
    emitter.on('logout', onLogout);

    emitter.emit('login', { user: 'Ann' });
    expect(onLogin).toHaveBeenCalledWith({ user: 'Ann' });
    expect(onLogout).not.toHaveBeenCalled();

    off();
    emitter.emit('login', { user: 'Bob' });
    expect(onLogin).toHaveBeenCalledTimes(1);

    emitter.emit('logout', undefined);
    expect(onLogout).toHaveBeenCalledTimes(1);

    // @ts-expect-error — wrong payload type must not compile
    void (() => emitter.emit('login', 42));
  });
});
