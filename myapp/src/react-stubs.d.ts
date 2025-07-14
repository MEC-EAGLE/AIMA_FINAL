declare module 'react' {
  export const useState: any;
  export const useEffect: any;
  export const useRef: any;
  export const createElement: any;
  export const StrictMode: any;
}

declare module 'react-dom/client' {
  export function createRoot(el: any): { render: (e: any) => void };
}

declare module 'react-router-dom' {
  export function BrowserRouter(props: any): any;
  export function Routes(props: any): any;
  export function Route(props: any): any;
  export function Link(props: any): any;
  export function Navigate(props: any): any;
  export function useNavigate(): any;
  export function useParams(): any;
  export function useSearchParams(): [URLSearchParams, any];
}

declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
declare module 'react/jsx-runtime' {
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
  export const Fragment: any;
}

declare const React: any;
