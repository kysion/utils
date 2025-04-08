import type { DevtoolsOptions, PersistOptions, PersistStorage, StorageValue } from 'zustand/middleware';
import { persist, devtools } from 'zustand/middleware';
import { StoreApi, UseBoundStore, create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { Funs, LocalStorageOptions, LocalStorageWrapper } from '.';


export function createLocalStore<S>(options: LocalStorageOptions): PersistStorage<S> {
    const storage = new LocalStorageWrapper<S>(options);

    const getItem = (name: string): StorageValue<S> | null => {
        const data = storage.get(name);
        if (!data) return null;

        return {
            state: data
        };
    }

    const setItem = (name: string, value: StorageValue<S>) => {
        if (value.state === undefined) {
            storage.remove(name);
            return;
        }

        storage.put({ key: name, data: value.state });
    }

    const removeItem = (name: string) => {
        storage.remove(name);
    }

    return {
        getItem,
        setItem,
        removeItem
    }
}

/**
 * WithSelectors类型，用于为store添加选择器
 * @internal 仅内部使用
 */
export type WithSelectors<S> = S extends { getState: () => infer T }
    ? S & { use: { [K in keyof T]: () => T[K] } }
    : never

/**
 * 为store添加选择器，方便访问单个状态
 * @internal 仅内部使用
 */
export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
    _store: S
): WithSelectors<S> => {
    const store = _store as WithSelectors<typeof _store>
    store.use = {}
    for (const k of Object.keys(store.getState())) {
        ; (store.use as any)[k] = () => store((s) => s[k as keyof typeof s])
    }

    return store
}

/**
 * 创建状态管理的store
 * 支持持久化和使用immer进行不可变数据操作
 */
export function createKyStore<T extends object>(
    initialState: T,
    persistOptions?: LocalStorageOptions & { version?: number },
    devtoolsOptions?: DevtoolsOptions & { name: string }
) {
    // 如果提供了 storageKey，则创建一个持久化的 store
    if (persistOptions) {
        const keyPrefix = Funs.getEnv('APP_STORE_PREFIX', 'Ky_');
        const storageKey = keyPrefix === persistOptions.storageKey ? '' : persistOptions.storageKey;

        return create<T>()(
            devtools(
                immer(
                    persist(
                        () => ({
                            ...initialState, // 初始化状态
                        }),
                        {
                            storage: createLocalStore({ ...persistOptions, keyPrefix: keyPrefix, storageKey }), // 使用 localStorage 进行存储
                            version: persistOptions.version ?? 1
                        } as PersistOptions<T> // 持久化选项
                    )
                ),
                {
                    name: devtoolsOptions?.name ?? storageKey,
                    enabled: true,
                    trace: true,
                    serialize: true,
                    deserialize: true,
                    ...devtoolsOptions
                }
            )
        ) as UseBoundStore<StoreApi<T>>;
    }
    // 如果未提供 storageKey，则创建一个持久化的 store
    return create<T>()(
        devtools(
            immer(
                () => ({
                    ...(initialState), // 初始化状态
                })
            ),
            {
                name: devtoolsOptions?.name,
                enabled: true,
                trace: true,
                serialize: true,
                deserialize: true,
                ...devtoolsOptions
            }
        )
    ) as UseBoundStore<StoreApi<T>>;
}
