/**
 * Context Initializer
 * Coordinates initialization of multiple contexts to prevent thundering herd
 */

class ContextInitializer {
  constructor() {
    this.initQueue = [];
    this.initialized = new Set();
    this.isInitializing = false;
    this.initDelay = 100; // ms between context initializations
  }

  /**
   * Register a context for coordinated initialization
   */
  register(contextName, initFn) {
    this.initQueue.push({
      name: contextName,
      fn: initFn,
      priority: this.getPriority(contextName),
    });

    // Sort by priority (lower number = higher priority)
    this.initQueue.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Get initialization priority for a context
   * Lower numbers initialize first
   */
  getPriority(contextName) {
    const priorities = {
      AuthContext: 0, // Must be first
      ChildSwitcherContext: 1, // Depends on Auth
      ParentalControlsContext: 2,
      ActivityDashboardContext: 3,
      AdvancedAnalyticsContext: 4,
      BadgeContext: 5,
      ScriptureMemoryContext: 5,
      StreakContext: 5,
      ThemeContext: 10, // Low priority
      LanguageContext: 10,
    };
    return priorities[contextName] ?? 100;
  }

  /**
   * Start coordinated initialization
   */
  async initialize() {
    if (this.isInitializing) return;
    this.isInitializing = true;

    try {
      for (const context of this.initQueue) {
        if (this.initialized.has(context.name)) continue;

        try {
          await context.fn();
          this.initialized.add(context.name);
        } catch (error) {
          console.error(`Failed to initialize ${context.name}:`, error);
        }

        // Stagger initialization to prevent thundering herd
        await new Promise((resolve) => setTimeout(resolve, this.initDelay));
      }
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Check if all contexts are initialized
   */
  isReady() {
    return this.initialized.size === this.initQueue.length;
  }

  /**
   * Reset initialization state
   */
  reset() {
    this.initialized.clear();
    this.isInitializing = false;
  }
}

export const contextInitializer = new ContextInitializer();

export default ContextInitializer;
