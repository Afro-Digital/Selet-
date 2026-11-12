import { describe, it, expect } from 'vitest';
import { APP_NAME } from './index';

describe('shared constants', () => {
  it('has the correct app name', () => {
    expect(APP_NAME).toBe('Selet');
  });
});
