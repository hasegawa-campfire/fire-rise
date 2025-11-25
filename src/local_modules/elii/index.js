/**
 * @fileoverview elii - Web Components based HTML component system
 *
 * eliiは*.m.html形式のHTMLモジュールをベースにした
 * リアクティブなコンポーネントシステムです。
 *
 * @example
 * import { defineComponent, reactive } from 'elii';
 *
 * export default defineComponent({
 *   tag: 'my-component',
 *   document: import.meta.document,
 *   props: { count: 0 },
 *   setup(props) {
 *     const state = reactive({ value: props.count });
 *     return { state };
 *   }
 * });
 */

export { defineComponent, isComponent } from './component.js'
export * from './reactive.js'
