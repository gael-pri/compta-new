export interface ComptaParam {
  id: number;
  key: string;
  label: string;
  value: number;
}

export interface ComptaParamsPort {
  get(key: string): Promise<ComptaParam | null>;
  updateValue(key: string, value: number): Promise<ComptaParam>;
}
