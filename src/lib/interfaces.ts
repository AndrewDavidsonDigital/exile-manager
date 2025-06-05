import type { Component } from "vue";

/**
 * Represents a route in the application
 */
export interface IRoute {
  /** The URL path for the route */
  path: string;
  /** The unique name identifier for the route */
  name: string;
  /** Optional display title for the route */
  title?: string,
  /** The Vue component to render for this route */
  component: Component;
}
