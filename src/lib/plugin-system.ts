type HookCallback = (...args: any[]) => any;

class PluginSystem {
  private actions: Map<string, Array<{ priority: number; callback: HookCallback }>> = new Map();
  private filters: Map<string, Array<{ priority: number; callback: HookCallback }>> = new Map();

  // ACTIONS
  addAction(hookName: string, callback: HookCallback, priority = 10) {
    if (!this.actions.has(hookName)) this.actions.set(hookName, []);
    this.actions.get(hookName)!.push({ priority, callback });
    this.actions.get(hookName)!.sort((a, b) => a.priority - b.priority);
  }

  doAction(hookName: string, ...args: any[]) {
    const hooks = this.actions.get(hookName);
    if (hooks) {
      hooks.forEach(({ callback }) => callback(...args));
    }
  }

  // FILTERS
  addFilter(hookName: string, callback: HookCallback, priority = 10) {
    if (!this.filters.has(hookName)) this.filters.set(hookName, []);
    this.filters.get(hookName)!.push({ priority, callback });
    this.filters.get(hookName)!.sort((a, b) => a.priority - b.priority);
  }

  applyFilters(hookName: string, value: any, ...args: any[]) {
    const hooks = this.filters.get(hookName);
    let result = value;
    if (hooks) {
      hooks.forEach(({ callback }) => {
        result = callback(result, ...args);
      });
    }
    return result;
  }
}

export const wp = new PluginSystem();
export const addAction = wp.addAction.bind(wp);
export const doAction = wp.doAction.bind(wp);
export const addFilter = wp.addFilter.bind(wp);
export const applyFilters = wp.applyFilters.bind(wp);
