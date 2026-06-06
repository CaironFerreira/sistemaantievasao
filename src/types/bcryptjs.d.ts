declare module "bcryptjs" {
  export function compare(value: string, hash: string): Promise<boolean>;
  export function hash(value: string, salt: number | string): Promise<string>;
}
