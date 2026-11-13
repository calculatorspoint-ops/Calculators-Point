import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

type DynamicOptions = { ssr?: boolean; loading?: ComponentType };

export default function dynamic<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T } | T>,
  _options: DynamicOptions = {},
): LazyExoticComponent<T> {
  return lazy(async () => {
    const loaded = await loader();
    return 'default' in loaded ? loaded : { default: loaded };
  });
}
