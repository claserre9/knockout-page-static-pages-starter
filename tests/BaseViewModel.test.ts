import { describe, it, expect } from 'vitest';
import { observable } from 'knockout';
import { BaseViewModel } from '../src/core/BaseViewModel';

class TestViewModel extends BaseViewModel {
  public message = observable('Hello');
  constructor() {
    super(undefined);
    this.setTemplate('<span data-bind="text: message"></span>');
  }
}

describe('BaseViewModel', () => {
  it('renders bound HTML', () => {
    const vm = new TestViewModel();
    const html = vm.renderHtml();
    expect(html).toContain('Hello');
  });
});
