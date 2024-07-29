export interface IYearlyStats {
  month: string;
  revenue: number;
}

export interface IYearlyStatsResponse {
  data: IYearlyStats[];
}
