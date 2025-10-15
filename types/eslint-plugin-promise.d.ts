// Minimal shim for eslint-plugin-promise which does not ship types
// This silences TS “cannot find type declarations” while keeping usage flexible.
declare module "eslint-plugin-promise" {
  // Minimal but useful typings for eslint-plugin-promise
  type RuleLevel = "off" | "warn" | "error" | 0 | 1 | 2;
  type RuleConfig = RuleLevel | [RuleLevel, ...unknown[]];

  interface LegacyConfig {
    plugins?: string[];
    rules: Record<string, RuleConfig>;
  }

  interface FlatConfigLike {
    name?: string;
    plugins?: Record<string, unknown>;
    rules?: Record<string, RuleConfig>;
  }

  const plugin: {
    rules: Record<string, unknown>;
    rulesConfig?: Record<string, RuleLevel>;
    configs: Record<string, LegacyConfig | FlatConfigLike>;
  };

  export = plugin;
}
