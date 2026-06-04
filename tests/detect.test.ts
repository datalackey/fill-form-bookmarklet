import { describe, it, expect, beforeEach } from 'vitest';
import { isReactForm } from '../src/detect.js';

beforeEach(function() {
  document.body.innerHTML = '';
});

describe('isReactForm', function() {
  it('returns false when no form and no React signals present', function() {
    document.body.innerHTML = '<form><input name="test"></form>';
    expect(isReactForm()).toBe(false);
  });

  it('returns true when data-reactroot is present', function() {
    document.body.innerHTML = '<div data-reactroot=""><form><input name="test"></form></div>';
    expect(isReactForm()).toBe(true);
  });

  it('returns true when form has __reactFiber key', function() {
    document.body.innerHTML = '<form><input name="test"></form>';
    const form = document.querySelector('form') as HTMLFormElement;
    (form as unknown as Record<string, string>)['__reactFiber123'] = 'x';
    expect(isReactForm()).toBe(true);
  });

  it('returns false when form exists but has no React signals', function() {
    document.body.innerHTML = '<form><input name="test"></form>';
    expect(isReactForm()).toBe(false);
  });
});
